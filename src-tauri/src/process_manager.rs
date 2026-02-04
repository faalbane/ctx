use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub enum SessionState {
    Idle,
    Working,
    Waiting,
}

#[derive(Debug, Clone)]
pub struct SessionInfo {
    pub id: String,
    pub project_id: String,
    pub state: String, // "idle" | "working" | "waiting"
    pub created_at: String,
    pub output_count: usize,
}

pub struct ManagedProcess {
    pub id: String,
    pub project_id: String,
    pub state: SessionState,
    pub created_at: String,
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

        let process = ManagedProcess {
            id: session_id.clone(),
            project_id: project_id.clone(),
            state: SessionState::Idle,
            created_at: chrono::Utc::now().to_rfc3339(),
        };

        let mut processes = self.processes.lock().map_err(|e| e.to_string())?;

        // Check concurrent session limit
        if processes.len() >= 5 {
            return Err("Maximum 5 concurrent sessions allowed".to_string());
        }

        processes.insert(session_id.clone(), process);

        // Emit session created event
        let _ = self.app_handle.emit_all(
            "session-created",
            serde_json::json!({
                "session_id": session_id.clone(),
                "project_id": project_id,
            }),
        );

        Ok(session_id)
    }

    pub fn terminate_session(&self, session_id: String) -> Result<(), String> {
        let mut processes = self.processes.lock().map_err(|e| e.to_string())?;

        if processes.remove(&session_id).is_some() {
            // Emit session terminated event
            let _ = self.app_handle.emit_all(
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
            .map(|p| SessionInfo {
                id: p.id.clone(),
                project_id: p.project_id.clone(),
                state: match p.state {
                    SessionState::Idle => "idle".to_string(),
                    SessionState::Working => "working".to_string(),
                    SessionState::Waiting => "waiting".to_string(),
                },
                created_at: p.created_at.clone(),
                output_count: 0,
            })
            .collect();

        Ok(sessions)
    }

    pub fn get_session(&self, session_id: &str) -> Result<SessionInfo, String> {
        let processes = self.processes.lock().map_err(|e| e.to_string())?;

        processes
            .get(session_id)
            .map(|p| SessionInfo {
                id: p.id.clone(),
                project_id: p.project_id.clone(),
                state: match p.state {
                    SessionState::Idle => "idle".to_string(),
                    SessionState::Working => "working".to_string(),
                    SessionState::Waiting => "waiting".to_string(),
                },
                created_at: p.created_at.clone(),
                output_count: 0,
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
            let _ = self.app_handle.emit_all(
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
}
