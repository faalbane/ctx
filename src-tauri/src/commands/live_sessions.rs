use crate::process_manager::{ProcessManager, SessionInfo, OutputLine};
use tauri::command;
use tauri::State;

#[command]
pub async fn spawn_claude_session(
    project_id: String,
    state: State<'_, ProcessManager>,
) -> Result<String, String> {
    state.spawn_session(project_id)
}

#[command]
pub async fn terminate_session(
    session_id: String,
    state: State<'_, ProcessManager>,
) -> Result<(), String> {
    state.terminate_session(session_id)
}

#[command]
pub fn list_active_sessions(
    state: State<'_, ProcessManager>,
) -> Result<Vec<SessionInfo>, String> {
    state.list_active_sessions()
}

#[command]
pub fn get_active_session(
    session_id: String,
    state: State<'_, ProcessManager>,
) -> Result<SessionInfo, String> {
    state.get_session(&session_id)
}

#[command]
pub async fn get_session_output(
    session_id: String,
    state: State<'_, ProcessManager>,
) -> Result<Vec<OutputLine>, String> {
    state.get_session_output(&session_id)
}

#[command]
pub async fn send_input_to_session(
    session_id: String,
    input: String,
    state: State<'_, ProcessManager>,
) -> Result<(), String> {
    state.write_to_session(&session_id, input)
}
