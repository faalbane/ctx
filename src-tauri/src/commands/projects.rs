use crate::models::Project;
use anyhow::Result;
use tauri::command;
use walkdir::WalkDir;

#[command]
pub fn scan_projects() -> Result<Vec<Project>, String> {
    let projects_dir = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".claude/projects");

    if !projects_dir.exists() {
        return Ok(Vec::new());
    }

    let mut projects = Vec::new();

    for entry in WalkDir::new(&projects_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_dir() && entry.path() != projects_dir {
            if let Some(name) = entry.file_name().to_str() {
                let project = Project {
                    id: name.to_string(),
                    name: name.to_string(),
                    path: entry.path().to_path_buf(),
                    sessions: Vec::new(),
                    created_at: chrono::Utc::now().to_rfc3339(),
                    is_favorite: false,
                };
                projects.push(project);
            }
        }
    }

    Ok(projects)
}

#[command]
pub fn get_project(project_id: String) -> Result<Project, String> {
    let projects_dir = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".claude/projects");

    let project_path = projects_dir.join(&project_id);

    if !project_path.exists() {
        return Err(format!("Project not found: {}", project_id));
    }

    // Try to read sessions from sessions-index.json
    let index_path = project_path.join("sessions-index.json");
    let mut sessions = Vec::new();

    if index_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&index_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(sessions_array) = json.get("sessions").and_then(|v| v.as_array()) {
                    for session in sessions_array {
                        if let Some(id) = session.get("id").and_then(|v| v.as_str()) {
                            sessions.push(id.to_string());
                        }
                    }
                }
            }
        }
    }

    Ok(Project {
        id: project_id.clone(),
        name: project_id,
        path: project_path,
        sessions,
        created_at: chrono::Utc::now().to_rfc3339(),
        is_favorite: false,
    })
}
