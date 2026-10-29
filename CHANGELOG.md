# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Milestone 7 (Phase 6): Procedural dynamics, analytic foot IK solver, and Center of Mass balance polygon validator.

## [1.5.0] - 2026-10-29

### Added
- Native VRMA & Animated GLB Importer (`src/infrastructure/vrma/vrma-importer.js`): Parses binary glTF animation tracks (`VRMC_vrm_animation` and standard glTF animations), bone rotations, root translations, and facial expressions.
- Inverse Semantic Solver (`src/domain/animation/inverse-solver.js`): Decompiles continuous 3D bone orientation quaternions into ClipKit semantic channels (`lean`, `twist`, `armR_elev`, `armR_azim`, `armR_roll`, `elbowL/R`, `kneeL/R`, `legL/R_swing`, `footL/R_pitch`).
- Zero-Phase Jitter Filter: Bidirectional low-pass filter with strict endpoint boundary locking to smooth motion capture sensor noise without phase lag.
- Easing-Aware Curve Simplification: Ramer-Douglas-Peucker (RDP) trajectory simplifier fitted with parametric easing curves (`linear`, `inOutSine`, `outQuad`, `inQuad`, `inOutQuad`) and sub-frame quadratic vertex extremum refinement.
- BVH Mocap Ingestion (`src/infrastructure/mocap/bvh-parser.js`): Hierarchical ASCII BVH parser with canonical bone alias dictionary (Mixamo, 3ds Max Biped, CMU, Humanoid) and automated foot-plant interval detection (`windows.planted_L`, `planted_R`).
- CLI Import Command: Added `clipkit import <file>` command with `--output`, `--epsilon`, `--filter-jitter`, `--report`, and `--json` flags.
- Web UI Drag-and-Drop Ingestion: Viewport and JSON editor panel support direct drag-and-drop ingestion of `.vrma`, `.glb`, and `.bvh` files with real-time compression telemetry badges in the status bar.
- Agent API Ingestion Methods: Exposed `importVrma()` and `importBvh()` on `window.clipkit`.

## [1.4.0] - 2026-10-28

### Added
- Automated Overlap Engine (`src/domain/animation/overlap-processor.js`): Kinetic chain delay propagator (Pelvis -> Spine -> Shoulders -> Wrists).
- Decaying Overshoot Calculator: Damped sinusoidal oscillation (`outElastic`) for organic settling phases.
- Motion Rhythm Templates: Anticipation, acceleration, overshoot, and settle timing profiles.
- Editor Overlap Controls: UI controls in Editor JSON panel for non-destructive live previewing and baking of overlap delays.
- Deterministic Overlap CLI & Layer Effect: Integrated overlap processing into CLI and composition layer definitions.

## [1.3.0] - 2026-10-28

### Added
- Agent Skill Packaging (`skills/clipkit/`): Comprehensive agent skill bundle with trigger guidelines, DSL references, and domain documentation.
- Autonomous Skill Build Pipeline (`scripts/build-skill.js`): Regenerates reference channels, rules documentation, bundles the standalone CLI, and packages `clipkit.skill`.
- Evals Suite (`skills/clipkit/evals/`): Automated skill evaluation runner verifying prompt fidelity, non-destructive variant branching, and validation compliance.
- Curated Asset Examples: Packaged representative reference clips (`walk`, `dodge`, `slash`, `punch_r`) for AI few-shot prompting.

## [1.2.0] - 2026-10-28

### Added
- Modular Composition Engine (`src/domain/animation/compose.js`): Pure multi-layer clip composition with `override` and `additive` modes, glob-based channel masking, and time offsets.
- Branching Variant Manifests: Hierarchical version tracking via `manifest.json` ensuring parent clips remain immutable.
- Kinematic Compare Engine (`src/domain/animation/compare.js`): Differential metric analysis across variants (peak angular velocity, airtime, root displacement, validation counts).
- Side-by-Side Visual Compare: Dual-silhouette comparative contact sheet generation with color-coded motion arcs.
- Deterministic Edit Operations (`src/domain/animation/edit-operations.js`): CLI operations for `mirror`, `retime`, `scale-amplitude`, and `close-loop`.
- Pose Library (`src/data/poses/`): Single-frame keyframe poses accessible via `clipkit poses` and layer references.

## [1.1.0] - 2026-10-28

### Added
- ClipKit Agent CLI (`src/cli/`): Machine-first deterministic command line interface (`bin/clipkit.mjs`) supporting `check`, `validate`, `schema`, `channels`, `rules`, `export`, and `sheet`.
- Structured Diagnostics Model: Standardized machine-readable issues with stable rule codes, exact kinematics values, limits, units, timestamps, and actionable remediation hints.
- Headless Contact Sheet Renderer (`src/presentation/export/contact-sheet-renderer.js`): Server-side SVG contact sheet generator with visual kinematics annotations (motion arcs, COM projection, ground plane, timing grid) and JSON telemetry sidecar.

## [1.0.0] - 2026-10-28

### Added
- Clean Architecture Modularization: Decoupled monolithic codebase into Domain, Application, Infrastructure, and Presentation layers with strict boundary enforcement (`tests/architecture.test.js`).
- Validation Rule Registry: Modular rule runner with discrete modules for angular speed, anatomical limits, floor penetration, root motion, windows, loop continuity, VRM 1.0 humanoid compliance, and version increments.
- Numerical Golden Pose Suite: Sub-millimeter (0.09 mm) precision validation against Godot 4.3 reference joint coordinates.
- Round-Trip Binary VRMA Exporter (`src/infrastructure/vrma/vrma-exporter.js`): Export to standard `VRMC_vrm_animation-1.0` binary glTF containers with < 0.05 deg angular preservation.
- Sample Model & Memory Bounded Buffer: Relocated `Deft.vrm` sample model, automated smoke tests, and bounded cache eviction for multi-megabyte VRM models.
- Canonical Agent API: Unified programmatic and testing interface (`window.clipkit`).
