use crate::models::{Message, MessageContent, Session};
use anyhow::Result;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

pub fn parse_session_jsonl(
    session_id: &str,
    project_id: &str,
    file_path: &Path,
) -> Result<Session> {
    let file = File::open(file_path)?;
    let reader = BufReader::new(file);

    let mut messages = Vec::new();
    let mut is_waiting = false;

    for line in reader.lines() {
        let line = line?;
        if line.trim().is_empty() {
            continue;
        }

        match serde_json::from_str::<serde_json::Value>(&line) {
            Ok(json) => {
                // Check if this is a message-type entry
                if let Some(entry_type) = json.get("type").and_then(|v| v.as_str()) {
                    match entry_type {
                        "message" => {
                            if let (Some(role), Some(content)) =
                                (json.get("role"), json.get("content"))
                            {
                                let role = role.as_str().unwrap_or("unknown").to_string();
                                let content = MessageContent::Object(content.clone());
                                let timestamp = json
                                    .get("timestamp")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("")
                                    .to_string();

                                let msg = Message {
                                    id: format!("msg_{}", messages.len()),
                                    role,
                                    content,
                                    timestamp,
                                };
                                messages.push(msg);
                            }
                        }
                        "user_input_required" | "waiting" => {
                            is_waiting = true;
                        }
                        _ => {}
                    }
                }
            }
            Err(_) => {
                // Skip malformed JSON lines
                continue;
            }
        }
    }

    let now = chrono::Utc::now().to_rfc3339();

    Ok(Session {
        id: session_id.to_string(),
        project_id: project_id.to_string(),
        name: session_id.to_string(),
        messages,
        created_at: now.clone(),
        updated_at: now,
        is_waiting,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_session_jsonl() {
        // Example test - would need a sample JSONL file
        let result = parse_session_jsonl("test_session", "test_project", Path::new("non_existent"));
        assert!(result.is_err());
    }
}
