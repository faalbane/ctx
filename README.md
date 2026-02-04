# CTX - Claude Code IDE with Neural Visualization

A desktop IDE for managing Claude Code sessions with a neuron-inspired visualization, real-time monitoring, and unified notifications.

## Tech Stack

- **Tauri 2.x** - Lightweight desktop framework (97% smaller than Electron)
- **React 18 + TypeScript** - Modern UI framework
- **React Three Fiber** - 3D neural network visualization
- **Zustand** - State management with persistence
- **Rust** - High-performance backend for file watching and JSONL parsing
- **Tailwind CSS** - Utility-first CSS framework

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

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Tauri CLI: `npm install -g @tauri-apps/cli`

### Installation

```bash
cd /Users/godfirstamen/CTX
npm install
```

### Development

```bash
npm run dev
```

This starts the Tauri dev server with hot reload.

### Build

```bash
npm run build
```

Creates production binaries for your platform.

## Features

### Phase 1: Core Infrastructure ✅
- [x] Tauri + React + TypeScript setup
- [x] Rust JSONL parser
- [x] IPC commands for projects/sessions
- [x] File system watcher
- [x] Zustand state management

### Phase 2: Basic UI ⏳
- [ ] Dual-sidebar layout (sidebar UI complete, needs integration)
- [ ] Project and thread lists
- [ ] Basic 3D visualization

### Phase 3: Advanced Visualization
- [ ] Second-level spokes (threads from projects)
- [ ] Synapse animations
- [ ] Camera navigation
- [ ] Performance optimization

### Phase 4: Notification System
- [ ] Message parsing for waiting states
- [ ] OS notifications
- [ ] Notification center

### Phase 5: Thread Management
- [ ] Thread renaming
- [ ] Conversation viewer
- [ ] Search and filtering

### Phase 6-7: Polish & Release
- [ ] Error handling
- [ ] Loading states
- [ ] Theme toggle
- [ ] Cross-platform testing

## Performance Targets

- **Startup**: < 1 second
- **File watching latency**: < 100ms
- **Memory usage**: < 150MB
- **Bundle size**: < 15MB
- **3D rendering**: 60fps with 100+ nodes

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

## Support

For issues and feedback, check the GitHub issues or reach out to the Claude Code team.
