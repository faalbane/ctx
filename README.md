# CTX - Visual IDE for Claude Code

A beautiful, fast macOS IDE that visualizes your Claude Code projects in stunning 3D. Manage multiple sessions simultaneously, stream output in real-time, and orchestrate complex multi-session workflows with ease.

[**Download Now**](https://github.com/faalbane/ctx/releases) • [Website](https://faalbane.github.io/ctx) • [GitHub](https://github.com/faalbane/ctx) • [Issues](https://github.com/faalbane/ctx/issues)

## ✨ Features

- **🎨 3D Neural Visualization** - Watch your projects come alive with interactive 3D visualization
- **⚡ Multi-Session Management** - Run up to 5 concurrent Claude Code sessions
- **📺 Real-time Output Streaming** - See execution unfold with live terminal output
- **⌨️ Interactive Input** - Send commands and stdin to running sessions
- **💾 Session Export** - Save transcripts as beautiful .log files
- **🎯 Beautiful UI** - Modern macOS design with dark/light themes
- **⌨️ Keyboard Shortcuts** - ⌘T for new thread, ESC to close, and more

## Tech Stack

- **Tauri 2.0** - Lightweight desktop framework (97% smaller than Electron)
- **React 18 + TypeScript** - Modern, performant UI
- **React Three Fiber** - 3D visualization with Three.js
- **Zustand** - Reactive state management
- **Rust Backend** - Fast file watching and JSONL parsing
- **Tailwind CSS** - Beautiful, responsive styling

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              CTX Desktop App (Tauri)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Projects │  │  Neural  │  │ Threads  │          │
│  │ Sidebar  │  │   Viz    │  │ Sidebar  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├─────────────────────────────────────────────────────┤
│  React + React Three Fiber + Zustand                │
├─────────────────────────────────────────────────────┤
│  Tauri IPC Layer (Type-safe commands)               │
├─────────────────────────────────────────────────────┤
│  Rust Backend (File watcher + JSONL parser)         │
└─────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    ~/.claude/          ~/.ctx/
    projects/           (CTX database)
```

## Project Structure

```
ctx/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands/             # IPC handlers
│   │   │   ├── projects.rs       # Project scanning
│   │   │   └── sessions.rs       # Session management
│   │   ├── watchers/             # File system watchers
│   │   │   └── session_watcher.rs
│   │   ├── parsers/              # JSONL parsers
│   │   │   └── session_parser.rs
│   │   ├── models/               # Data structures
│   │   │   ├── project.rs
│   │   │   └── session.rs
│   │   └── main.rs
│   └── Cargo.toml
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── LeftSidebar.tsx   # Projects
│   │   │   └── RightSidebar.tsx  # Threads
│   │   ├── visualization/
│   │   │   ├── NeuralCanvas.tsx  # Main 3D canvas
│   │   │   ├── HubNode.tsx       # Central hub
│   │   │   ├── ProjectNode.tsx   # Project nodes
│   │   │   └── Synapse.tsx       # Animated connections
│   │   ├── projects/
│   │   │   └── ProjectList.tsx
│   │   ├── threads/
│   │   │   └── ThreadList.tsx
│   │   └── notifications/
│   │       └── NotificationCenter.tsx
│   ├── stores/                   # Zustand stores
│   │   ├── useProjectStore.ts
│   │   ├── useThreadStore.ts
│   │   └── useNotificationStore.ts
│   ├── services/
│   │   └── tauriService.ts       # IPC wrapper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Quick Start

### For Users

1. **Download** the latest DMG from [releases](https://github.com/faalbane/ctx/releases)
2. **Mount** the DMG and drag CTX to Applications
3. **Launch** CTX from Applications
4. **Enjoy!** Start managing your Claude Code projects

**Requirements:** macOS 10.13+, Claude Code CLI installed

### For Developers

**Prerequisites:**
- Node.js 18+
- Rust 1.70+
- macOS 10.13+

**Setup:**
```bash
git clone https://github.com/faalbane/ctx.git
cd ctx
npm install
```

**Development:**
```bash
npm run dev
```

**Build for release:**
```bash
npm run build
./scripts/create-dmg.sh v1.0.0
```

**Notarize for distribution (requires Apple Developer account):**
```bash
APPLE_ID="you@apple.com" TEAM_ID="XXXXX" APP_PASSWORD="xxxx-xxxx-xxxx" ./scripts/notarize.sh "src-tauri/target/release/bundle/macos/CTX.app"
```

## Implemented Features

✅ **Core**
- Tauri 2.0 + React 18 + TypeScript
- Rust backend with file watcher and JSONL parser
- IPC commands for projects and sessions

✅ **Visualization**
- Interactive 3D neural network with React Three Fiber
- Real-time node state detection (idle/working/waiting)
- Animated connections and visual feedback

✅ **Sessions**
- Multi-session Claude Code orchestration (5 concurrent limit)
- Real-time output streaming terminal panel
- Interactive stdin input support
- Session state indicators with color-coded nodes

✅ **UI/UX**
- Dual-sidebar layout (projects + threads)
- Resizable sidebars with persistence
- Dark/light theme support
- Keyboard shortcuts (⌘/Ctrl+T, ESC)
- Smooth CSS animations throughout

✅ **Data**
- Session logging and export to .log files
- Notification center with timestamps
- Project and thread management
- Persistent state with Zustand

## Roadmap

🚀 **Upcoming**
- Auto-update system for seamless updates
- Windows and Linux support
- Custom themes and color palettes
- Session bookmarking and history
- Export to JSON/CSV formats
- GitHub integration for project templates
- Performance profiling and metrics

## Performance

- **Startup**: < 1 second
- **File watching latency**: < 100ms
- **Memory usage**: < 150MB
- **Bundle size**: ~50MB (DMG)
- **3D rendering**: 60fps with 100+ nodes
- **Concurrent sessions**: 5 (configurable limit)

## Integration with Claude Code

CTX operates as a **read-only observer** of Claude Code's file system:

- Monitors `~/.claude/projects/` directory
- Parses `sessions-index.json` for each project
- Watches `.jsonl` session files for real-time updates
- Detects when user input is needed
- Never modifies Claude Code's internal files

## Development Notes

### Adding New IPC Commands

1. Add Rust handler in `src-tauri/src/commands/`
2. Register in `src-tauri/src/main.rs`
3. Create TypeScript wrapper in `src/services/tauriService.ts`
4. Use in React components

### State Management

- Use Zustand stores for global state
- Persist to localStorage automatically (configured in store)
- Emit Tauri events for real-time updates

### 3D Visualization

- Built with React Three Fiber for performant 3D rendering
- Use `useFrame` hook for animations
- Optimize geometry and materials for performance

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Support & Feedback

- **Issues**: [GitHub Issues](https://github.com/faalbane/ctx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/faalbane/ctx/discussions)
- **Website**: [faalbane.github.io/ctx](https://faalbane.github.io/ctx)

## Release Information

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

For information on building and releasing new versions, see the scripts in `./scripts/`:
- `create-dmg.sh` - Package app into DMG for distribution
- `notarize.sh` - Submit app for Apple notarization (requires Developer account)

## License

MIT - See LICENSE file for details
