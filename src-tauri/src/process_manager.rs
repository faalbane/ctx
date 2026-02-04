use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex, mpsc};
use tauri::{AppHandle, Emitter};
use uuid::Uuid;
use std::io::Write;

#[derive(Debug, Clone)]
pub enum SessionState {
    Idle,
    Working,
    Waiting,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SessionInfo {
    pub id: String,
    pub project_id: String,
    pub state: String, // "idle" | "working" | "waiting"
    pub created_at: String,
    pub output_count: usize,
}

#[derive(Clone, serde::Serialize)]
pub struct OutputLine {
    pub timestamp: String,
    pub text: String,
    pub line_type: String, // "stdout" | "stderr"
}

pub struct ManagedProcess {
    pub id: String,
    pub project_id: String,
    pub state: SessionState,
    pub created_at: String,
    pub output_buffer: Arc<Mutex<VecDeque<OutputLine>>>,
    pub stdin_sender: Option<mpsc::Sender<String>>,
}

pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<String, ManagedProcess>>>,
    app_handle: AppHandle,
}

impl ProcessManager {
    pub fn new(app_handle: AppHandle) -> Self {
        ProcessManager {
            processes: Arc::new(Mutex::new(HashMap::new())),
            app_handle,
        }
    }

    pub fn spawn_session(&self, project_id: String) -> Result<String, String> {
        let session_id = Uuid::new_v4().to_string();

        let output_buffer = Arc::new(Mutex::new(VecDeque::new()));
        let (stdin_tx, stdin_rx) = mpsc::channel();

        let process = ManagedProcess {
            id: session_id.clone(),
            project_id: project_id.clone(),
            state: SessionState::Idle,
            created_at: chrono::Utc::now().to_rfc3339(),
            output_buffer: output_buffer.clone(),
            stdin_sender: Some(stdin_tx),
        };

        let mut processes = self.processes.lock().map_err(|e| e.to_string())?;

        // Check concurrent session limit
        if processes.len() >= 5 {
            return Err("Maximum 5 concurrent sessions allowed".to_string());
        }

        processes.insert(session_id.clone(), process);

        // Emit session created event
        let _ = self.app_handle.emit(
            "session-created",
            serde_json::json!({
                "session_id": session_id.clone(),
                "project_id": project_id.clone(),
            }),
        );

        // Spawn the actual Claude CLI process in background
        let app_handle = self.app_handle.clone();
        let session_id_clone = session_id.clone();
        let project_id_clone = project_id.clone();

        std::thread::spawn(move || {
            if let Err(e) = Self::run_session(
                session_id_clone,
                project_id_clone,
                app_handle,
                output_buffer,
                stdin_rx,
            ) {
                eprintln!("Session error: {}", e);
            }
        });

        Ok(session_id)
    }

    fn detect_state(text: &str) -> SessionState {
        let lower = text.to_lowercase();

        // Check for waiting indicators
        if lower.contains("continue?")
            || lower.contains("enter input:")
            || lower.contains("(y/n)")
            || lower.contains("(yes/no)")
        {
            return SessionState::Waiting;
        }

        // Check for working indicators
        if lower.contains("calling tool:")
            || lower.contains("reading file:")
            || lower.contains("writing to file:")
            || lower.contains("executing command:")
            || lower.contains("thinking...")
            || lower.contains("processing")
        {
            return SessionState::Working;
        }

        SessionState::Idle
    }

    fn run_session(
        session_id: String,
        project_id: String,
        app_handle: AppHandle,
        output_buffer: Arc<Mutex<VecDeque<OutputLine>>>,
        stdin_rx: mpsc::Receiver<String>,
    ) -> Result<(), String> {
        // Spawn Claude CLI with project context using standard process
        let mut command = std::process::Command::new("claude")
            .arg("--project")
            .arg(&project_id)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn Claude CLI: {}", e))?;

        // Handle stdin in a separate thread
        if let Some(mut stdin) = command.stdin.take() {
            std::thread::spawn(move || {
                while let Ok(input) = stdin_rx.recv() {
                    let _ = writeln!(stdin, "{}", input);
                }
            });
        }

        // Read stdout
        if let Some(stdout) = command.stdout.take() {
            let app_handle_clone = app_handle.clone();
            let session_id_clone = session_id.clone();
            let buffer_clone = output_buffer.clone();

            std::thread::spawn(move || {
                use std::io::BufRead;
                let reader = std::io::BufReader::new(stdout);
                let mut last_state = SessionState::Idle;

                for line in reader.lines() {
                    if let Ok(text) = line {
                        // Detect state change
                        let new_state = Self::detect_state(&text);
                        if !matches!(new_state, SessionState::Idle if matches!(last_state, SessionState::Idle)) {
                            // Emit state changed event if state differs from idle or changed
                            let _ = app_handle_clone.emit(
                                "session-state-changed",
                                serde_json::json!({
                                    "session_id": session_id_clone,
                                    "state": match new_state {
                                        SessionState::Idle => "idle",
                                        SessionState::Working => "working",
                                        SessionState::Waiting => "waiting",
                                    },
                                }),
                            );
                            last_state = new_state;
                        }

                        let output_line = OutputLine {
                            timestamp: chrono::Utc::now().to_rfc3339(),
                            text: text.clone(),
                            line_type: "stdout".to_string(),
                        };

                        // Add to buffer (keep max 10k lines)
                        if let Ok(mut buf) = buffer_clone.lock() {
                            if buf.len() >= 10000 {
                                buf.pop_front();
                            }
                            buf.push_back(output_line.clone());
                        }

                        // Emit to frontend
                        let _ = app_handle_clone.emit(
                            "session-output",
                            serde_json::json!({
                                "session_id": session_id_clone,
                                "line": text,
                                "timestamp": output_line.timestamp,
                                "type": "stdout",
                            }),
                        );
                    }
                }
            });
        }

        // Read stderr
        if let Some(stderr) = command.stderr.take() {
            let app_handle_clone = app_handle.clone();
            let session_id_clone = session_id.clone();
            let buffer_clone = output_buffer.clone();

            std::thread::spawn(move || {
                use std::io::BufRead;
                let reader = std::io::BufReader::new(stderr);
                for line in reader.lines() {
                    if let Ok(text) = line {
                        let output_line = OutputLine {
                            timestamp: chrono::Utc::now().to_rfc3339(),
                            text: text.clone(),
                            line_type: "stderr".to_string(),
                        };

                        // Add to buffer
                        if let Ok(mut buf) = buffer_clone.lock() {
                            if buf.len() >= 10000 {
                                buf.pop_front();
                            }
                            buf.push_back(output_line.clone());
                        }

                        // Emit to frontend
                        let _ = app_handle_clone.emit(
                            "session-output",
                            serde_json::json!({
                                "session_id": session_id_clone,
                                "line": text,
                                "timestamp": output_line.timestamp,
                                "type": "stderr",
                            }),
                        );
                    }
                }
            });
        }

        // Wait for process to complete
        let status = command.wait().map_err(|e| e.to_string())?;

        // Emit session completion
        let _ = app_handle.emit(
            "session-completed",
            serde_json::json!({
                "session_id": session_id,
                "exit_code": status.code(),
            }),
        );

        Ok(())
    }

    pub fn terminate_session(&self, session_id: String) -> Result<(), String> {
        let mut processes = self.processes.lock().map_err(|e| e.to_string())?;

        if processes.remove(&session_id).is_some() {
            // Emit session terminated event
            let _ = self.app_handle.emit(
                "session-terminated",
                serde_json::json!({
                    "session_id": session_id,
                }),
            );
            Ok(())
        } else {
            Err(format!("Session not found: {}", session_id))
        }
    }

    pub fn list_active_sessions(&self) -> Result<Vec<SessionInfo>, String> {
        let processes = self.processes.lock().map_err(|e| e.to_string())?;

        let sessions = processes
            .values()
            .map(|p| {
                let output_count = p
                    .output_buffer
                    .lock()
                    .map(|buf| buf.len())
                    .unwrap_or(0);

                SessionInfo {
                    id: p.id.clone(),
                    project_id: p.project_id.clone(),
                    state: match p.state {
                        SessionState::Idle => "idle".to_string(),
                        SessionState::Working => "working".to_string(),
                        SessionState::Waiting => "waiting".to_string(),
                    },
                    created_at: p.created_at.clone(),
                    output_count,
                }
            })
            .collect();

        Ok(sessions)
    }

    pub fn get_session(&self, session_id: &str) -> Result<SessionInfo, String> {
        let processes = self.processes.lock().map_err(|e| e.to_string())?;

        processes
            .get(session_id)
            .map(|p| {
                let output_count = p
                    .output_buffer
                    .lock()
                    .map(|buf| buf.len())
                    .unwrap_or(0);

                SessionInfo {
                    id: p.id.clone(),
                    project_id: p.project_id.clone(),
                    state: match p.state {
                        SessionState::Idle => "idle".to_string(),
                        SessionState::Working => "working".to_string(),
                        SessionState::Waiting => "waiting".to_string(),
                    },
                    created_at: p.created_at.clone(),
                    output_count,
                }
            })
            .ok_or_else(|| format!("Session not found: {}", session_id))
    }

    pub fn update_session_state(
        &self,
        session_id: &str,
        new_state: SessionState,
    ) -> Result<(), String> {
        let mut processes = self.processes.lock().map_err(|e| e.to_string())?;

        if let Some(process) = processes.get_mut(session_id) {
            process.state = new_state.clone();

            // Emit state changed event
            let _ = self.app_handle.emit(
                "session-state-changed",
                serde_json::json!({
                    "session_id": session_id,
                    "state": match new_state {
                        SessionState::Idle => "idle",
                        SessionState::Working => "working",
                        SessionState::Waiting => "waiting",
                    },
                }),
            );

            Ok(())
        } else {
            Err(format!("Session not found: {}", session_id))
        }
    }

    pub fn get_session_output(&self, session_id: &str) -> Result<Vec<OutputLine>, String> {
        let processes = self.processes.lock().map_err(|e| e.to_string())?;

        processes
            .get(session_id)
            .map(|p| {
                p.output_buffer
                    .lock()
                    .map(|buf| buf.iter().cloned().collect())
                    .unwrap_or_default()
            })
            .ok_or_else(|| format!("Session not found: {}", session_id))
    }

    pub fn write_to_session(&self, session_id: &str, input: String) -> Result<(), String> {
        let processes = self.processes.lock().map_err(|e| e.to_string())?;

        if let Some(process) = processes.get(session_id) {
            if let Some(ref stdin_sender) = process.stdin_sender {
                stdin_sender
                    .send(input)
                    .map_err(|e| format!("Failed to send input: {}", e))
            } else {
                Err("Session stdin not available".to_string())
            }
        } else {
            Err(format!("Session not found: {}", session_id))
        }
    }
}
