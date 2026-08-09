# Aoles GL React Demo

Demo application for the `@aoles-gl/react` library.

## Getting Started

Prerequisites: Node.js 18+, pnpm 11.18.0, and the `aoles-gl-web-package`
repository cloned next to this repository.

1. Build and install the package tarballs:
```bash
pnpm packages:install
```

2. Start development server:
```bash
pnpm dev
```

3. Open http://localhost:4009

`pnpm packages:install` consumes the publishable tarballs rather than linked
source directories. After version `0.1.0` is published, run
`npm run registry:verify` to verify the actual registry release.

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

Place font files for text rendering in `public/fonts/`.

GLSL shaders are provided by `@aoles-gl/effects` and resolved through
`resolveGlslUrl`; do not copy them into this demo's `public/` directory.
