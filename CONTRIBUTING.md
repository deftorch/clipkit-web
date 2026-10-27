# Contributing to ClipKit Web

Thank you for your interest in contributing to ClipKit Web! This document provides guidelines and instructions for contributing to this project.

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (or **Bun** v1.0+).
- **Git**

### Local Setup
```bash
# 1. Clone your fork or the repository
git clone https://github.com/your-username/clipkit-web.git
cd clipkit-web

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run automated test suite
npm test
```

---

## Architecture & Code Organization

ClipKit Web follows **Clean Architecture** principles. When adding or modifying code, adhere to layer boundaries:

- `src/domain/`: Pure business logic (mathematics, keyframe sampling, Forward Kinematics, rules engine). **Zero external dependencies.**
- `src/infrastructure/`: Drivers and adapters (Three.js 3D rendering, binary glTF / VRM parsers).
- `src/application/`: State stores (playback, clip collection, camera, theme).
- `src/presentation/`: User interface components, canvas 2D renderers, viewport controls, and timeline scrubber.
- `src/data/`: Default rigs, animation clips, and validation limits.

---

## Coding Guidelines

1. **Vanilla JavaScript (ES Modules)**: Use standard modern JavaScript (`import` / `export`) without heavy framework abstractions unless strictly requested.
2. **Formatting**: Ensure 2 spaces indentation, LF line endings, and trimmed whitespace (enforced via `.editorconfig`).
3. **No Breakages in Single-File Bundling**: The project must always successfully build with `npm run build` using `vite-plugin-singlefile`.
4. **Unit Tests**: Any change to domain logic (math, pose evaluation, validation rules, or exporter) must include corresponding test coverage under `tests/`.

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature (e.g., `feat: add contact sheet exporter`)
- `fix:` A bug fix (e.g., `fix: resolve knee hyperextension calculation`)
- `docs:` Documentation only changes (e.g., `docs: update ROADMAP.md`)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Maintenance tasks, dependency updates, configuration

---

## Pull Request Process

1. Create a feature branch from `master` / `main` (`git checkout -b feat/my-new-feature`).
2. Implement your changes following layer conventions.
3. Run `npm test` and `npm run build` to verify that all tests pass and the bundle builds cleanly.
4. Submit a Pull Request with a clear description of the problem solved and testing performed.
