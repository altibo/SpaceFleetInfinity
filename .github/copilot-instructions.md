# WireVerse Development Guide

## Project Overview
WireVerse is a minimalist 3D wireframe space game built with Three.js, TypeScript, and Vite. It features a 1980s vector graphics aesthetic with white lines on a black background.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

## Code Guidelines

### TypeScript
- Always use strict mode
- Explicit type annotations for function parameters and returns
- JSDoc comments for all classes and public methods
- Maximum 300 lines per file

### File Organization
- Each class handles a single responsibility
- Organize code into logical modules
- Use barrel exports for cleaner imports

### Development Commands
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Check code quality
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format code with Prettier
```

## Architecture

### Engine (`src/engine/`)
- **Engine.ts**: Core rendering loop and WebGL setup
- **InputManager.ts**: Keyboard input handling
- **CameraManager.ts**: Camera and stereo camera management

### Scene (`src/scene/`)
- **GameScene.ts**: Main game scene orchestration
- **Ship.ts**: Wireframe spaceship model
- **World.ts**: World objects container

### VR (`src/vr/`)
- **WebXRManager.ts**: WebXR session management
- **StereoRenderer.ts**: Split-screen stereo rendering

## Key Features

### Controls
- W/S: Pitch rotation
- A/D: Yaw rotation
- Q/E: Roll rotation
- V: Toggle VR mode

### Performance Targets
- Desktop: 60 FPS
- VR: 72 FPS

### Graphics
- Black background (#000000)
- White wireframe lines (#FFFFFF)
- No lighting, shadows, or textures

## Testing & Deployment

### Local Testing
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### GitHub Pages Deployment
Push to `main` branch triggers automatic deployment via GitHub Actions.

## Future Extensions
The modular architecture supports:
- Planets and asteroids
- Enemy ships and weapons
- Particle systems
- Multiplayer
- Physics engine
- AI
- Procedural generation

---

For detailed information, see [README.md](../README.md)
