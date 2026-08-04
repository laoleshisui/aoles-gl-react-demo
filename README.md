# Aoles GL React Demo

Demo application for the `@aoles-gl/react` library.

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Open http://localhost:4009

## Features

- WebGL-based video preview
- Drag-and-drop resource import
- Timeline editor (in progress)
- Real-time rendering

## Architecture

This demo uses:
- **React 18** for UI
- **Zustand** for state management
- **@aoles-gl/react** for video editing components
- **WASM** for high-performance rendering

## Assets Required

Place the following assets in `public/`:
- `/fonts/` - Font files for text rendering
- `/glsl/` - GLSL shaders for effects and transitions

Copy from the Vue test project or provide your own.
