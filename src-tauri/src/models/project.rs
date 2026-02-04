use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub sessions: Vec<String>,
    pub created_at: String,
    pub is_favorite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectIndex {
    pub sessions: Vec<SessionRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRef {
    pub id: String,
    pub name: String,
    pub created: String,
}
