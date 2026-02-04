// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod parsers;
mod process_manager;
mod watchers;

use process_manager::ProcessManager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::projects::scan_projects,
            commands::projects::get_project,
            commands::projects::rename_project,
            commands::sessions::get_session,
            commands::sessions::list_sessions,
            commands::live_sessions::spawn_claude_session,
            commands::live_sessions::terminate_session,
            commands::live_sessions::list_active_sessions,
            commands::live_sessions::get_session,
            commands::live_sessions::get_session_output,
        ])
        .setup(|app| {
            let handle = app.handle().clone();

            // Initialize ProcessManager for live session management
            let process_manager = ProcessManager::new(handle.clone());
            app.manage(process_manager);

            // Initialize file watchers
            std::thread::spawn(move || {
                watchers::session_watcher::start_watching(handle)
                    .expect("Failed to start file watcher");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
