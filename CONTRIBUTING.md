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

ClipKit Web is organized in four layers plus data. The dependency rule is:

```
presentation -> application -> domain
infrastructure -> domain
```

`domain` imports nothing outside `domain`. `application` defines the ports it needs (state, storage, rendering, loading); `infrastructure` implements them; `main.js` is the only place that wires implementations together.

- `src/domain/`: Pure business logic (mathematics, keyframe sampling, Forward Kinematics, validation rules). No DOM, `window`, `localStorage` or Three.js.
- `src/application/`: State stores and use cases that depend on ports, not on concrete adapters.
- `src/infrastructure/`: Drivers and adapters (Three.js mesh rendering, binary glTF / VRM parsing, storage, export).
- `src/presentation/`: User interface components, canvas 2D renderers, viewport controls, and the timeline scrubber.
- `src/data/`: Default rigs, animation clips, and validation limits.

**Known deviations.** The rule is the target, and it is not fully enforced yet. Today `src/application/state/rig-store.js` imports the Three.js renderer and the GLB/VRM parsers, `src/presentation/viewport/viewport-controller.js` imports the Three.js renderer, `src/application/state/clip-store.js` reads and writes `localStorage`, `src/application/theme.js` uses `document` and `window`, and `src/main.js` still contains scene rendering (`drawScene`) and the `window.ClipKit`, `window.VrmRig`, `window.VrmView` and `window.__clipkit` globals. These are tracked in `TODO.md` (Milestone 1: Architecture Hardening). New code must not add to them, and changes that touch these areas should move them toward the rule.

**Adding things.** New validation rules, panels, channel types and easing curves should be added as new modules that register themselves, rather than by extending an existing function or list. See `ROADMAP.md` Phase C0.

---

## Coding Guidelines

1. **Vanilla JavaScript (ES Modules)**: Use standard modern JavaScript (`import` / `export`) without heavy framework abstractions unless strictly requested.
2. **Formatting**: Ensure 2 spaces indentation, LF line endings, and trimmed whitespace (enforced via `.editorconfig`).
3. **No Breakages in Single-File Bundling**: The project must always successfully build with `npm run build` using `vite-plugin-singlefile`.
4. **Unit Tests**: Any change to domain logic (math, pose evaluation, validation rules, or exporter) must include corresponding test coverage under `tests/`.
5. **Agent-Facing Output**: Validation output is consumed by AI agents as well as people. Messages should name the joint or channel, the measured value, the limit and the time. Once the structured issue model lands (`TODO.md` Milestone 2), rule codes are treated as public API and are not renamed or removed without a documented change.

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
