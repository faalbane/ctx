# Changelog

All notable changes to CTX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Auto-update system for seamless version updates
- Windows and Linux support
- Custom themes and color schemes
- Session bookmarking and history
- Export to various formats (JSON, CSV)
- Integration with GitHub for project templates

## [0.1.0] - 2026-02-04

### Added
- Initial public release
- Core infrastructure with Tauri 2.0 + React 18
- Dual sidebar layout with project and thread management
- Interactive 3D neural network visualization
- Multi-session Claude Code orchestration (5 concurrent limit)
- Real-time output streaming terminal panel
- Session state detection with visual indicators
- Interactive session input via stdin
- Session export to .log files
- Keyboard shortcuts (⌘/Ctrl+T for new thread, ESC to close)
- Settings panel with theme/refresh options
- Notification center with timestamps
- Sidebar resizing with persistence
- Beautiful CSS animations throughout

### Features
- **Visual 3D Workspace**: Watch your projects come to life with an interactive neural network visualization
- **Multi-Session Management**: Launch and manage up to 5 concurrent Claude Code sessions
- **Real-time Streaming**: Stream command output directly into the terminal panel with live updates
- **Interactive Input**: Provide stdin input to running sessions without leaving CTX
- **Professional UI**: Modern macOS-inspired design with dark/light theme support
- **Session Logging**: Export full session transcripts for documentation and analysis

### Technical Stack
- Tauri 2.0 for lightweight desktop application
- React 18 + TypeScript for UI
- React Three Fiber + Three.js for 3D visualization
- Zustand for state management
- Tailwind CSS for styling
- Rust backend with tauri-plugin-shell for process management

### Documentation
- Landing page with feature highlights
- Quick start guide
- Installation instructions for macOS

---

## Release Process

To create a new release:

1. Update version in `package.json` and `src-tauri/tauri.conf.json`
2. Update this CHANGELOG with the new version
3. Commit changes: `git commit -m "Release v1.0.0"`
4. Create git tag: `git tag v1.0.0`
5. Push: `git push origin main && git push origin v1.0.0`
6. GitHub Actions will automatically build and create the release

Detailed instructions in [RELEASING.md](./RELEASING.md) (if available)
