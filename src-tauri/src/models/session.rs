use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub messages: Vec<Message>,
    pub created_at: String,
    pub updated_at: String,
    pub is_waiting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub role: String,
    pub content: MessageContent,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MessageContent {
    Text(String),
    Object(serde_json::Value),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Thread {
    pub id: String,
    pub session_id: String,
    pub name: String,
    pub agents: Vec<AgentState>,
    pub message_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentState {
    pub id: String,
    pub name: String,
    pub status: String, // "idle", "running", "waiting"
}
