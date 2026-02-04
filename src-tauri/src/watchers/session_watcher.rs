use anyhow::Result;
use notify::{Watcher, RecursiveMode, RecommendedWatcher};
use std::sync::mpsc;
use std::time::Duration;
use tauri::AppHandle;

pub fn start_watching(_app_handle: AppHandle) -> Result<()> {
    let projects_dir = dirs::home_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not determine home directory"))?
        .join(".claude/projects");

    if !projects_dir.exists() {
        return Ok(());
    }

    let (tx, rx) = mpsc::channel();

    let mut watcher = RecommendedWatcher::new(
        move |res| {
            let _ = tx.send(res);
        },
        notify::Config::default()
            .with_poll_interval(Duration::from_millis(100)),
    )?;

    watcher.watch(&projects_dir, RecursiveMode::Recursive)?;

    // Process events in background thread
    std::thread::spawn(move || {
        for res in rx {
            match res {
                Ok(event) => {
                    // For now, just log events
                    // In the future, emit to frontend via app_handle.emit_all()
                    println!("File event: {:?}", event);
                }
                Err(e) => {
                    eprintln!("Watch error: {:?}", e);
                }
            }
        }
    });

    Ok(())
}
