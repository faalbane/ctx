use crate::models::Session;
use crate::parsers::parse_session_jsonl;
use anyhow::Result;
use tauri::command;

#[command]
pub fn list_sessions(project_id: String) -> Result<Vec<String>, String> {
    let projects_dir = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".claude/projects");

    let project_path = projects_dir.join(&project_id);
    let index_path = project_path.join("sessions-index.json");

    if !index_path.exists() {
        return Ok(Vec::new());
    }

    let content = std::fs::read_to_string(&index_path).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    let mut sessions = Vec::new();
    if let Some(sessions_array) = json.get("sessions").and_then(|v| v.as_array()) {
        for session in sessions_array {
            if let Some(id) = session.get("id").and_then(|v| v.as_str()) {
                sessions.push(id.to_string());
            }
        }
    }

    Ok(sessions)
}

#[command]
pub fn get_session(project_id: String, session_id: String) -> Result<Session, String> {
    let projects_dir = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".claude/projects");

    let session_file = projects_dir
        .join(&project_id)
        .join(format!("{}.jsonl", session_id));

    if !session_file.exists() {
        return Err(format!("Session not found: {}", session_id));
    }

    parse_session_jsonl(&session_id, &project_id, &session_file)
        .map_err(|e| format!("Failed to parse session: {}", e))
}
