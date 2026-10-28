# ClipKit Web — Implementation Task List

This document tracks all immediate fixes, quality hardening tasks, and roadmap milestone deliverables for ClipKit Web.

---

## Milestone 0: Critical Fixes & Quality Hardening (Priority)

### 0.1 Fix VRM Model Loading Crash
- [ ] In `src/application/state/rig-store.js`, import `parseGlb` from `../../infrastructure/vrm/glb-parser.js` instead of calling `VrmRig.parseGlb` (which is undefined).
- [ ] Verify that drag-and-drop and the file input button successfully parse binary GLB/VRM files without throwing `TypeError`.

### 0.2 Fix Mesh Lifecycle & UI Toggle Synchronization
- [ ] Remove redundant duplicate call to `ensureMesh` in `loadVrmFile` (eliminate duplicate buffer copying).
- [ ] Ensure that when `VrmView.load()` resolves asynchronously:
  - Set `playbackState.mesh = true` and `playbackState.skel = false`.
  - Trigger `viewportCtrl.syncToggles()` so the "Mesh" button in the 3D viewport enables and highlights.
  - Trigger `renderRig()` to update mesh polygon and object statistics.
  - Trigger `dirtyAll()` to immediately render the 3D mesh on canvas.
- [ ] Add bounds or eviction policy to `MESHBUF` in `rig-store.js` to prevent unbounded memory growth when loading multiple 15MB+ VRM files.

### 0.3 Integrate `Deft.vrm` Sample Model & Automated Smoke Test
- [ ] Relocate `Deft.vrm` from root to `public/models/deft.vrm` for client-side demo use, and create `tests/fixtures/deft.vrm` (or shared reference) for testing.
- [ ] Add automated smoke test `tests/vrm-loading.test.js` to verify:
  - Reading a binary VRM 1.0 file.
  - Parsing GLB chunks with `parseGlb`.
  - Building rig with `buildRig` without exceptions.
  - Generating valid rig metadata (22/22 bones present).

### 0.4 Lock Numerical Precision (True Golden Pose Assertions)
- [ ] In `tests/golden-pose.test.js`, replace shallow length checks (`expect(p0.pos.length).toBe(...)`) with exact coordinate assertions against Godot reference values (`[x, y, z]` joint positions within $0.09\text{ mm}$ tolerance).
- [ ] Add a round-trip `.vrma` export test:
  - Export reference clips (`slash`, `dodge`, `walk`) to binary `.vrma`.
  - Parse the binary glTF output and verify animation samplers match source keyframes within $0.05^\circ$ angular error.

### 0.5 Harden Validator for AI Agent Generation
- [ ] In `src/domain/validation/rules/channel-ranges.js`, elevate unknown channel names from `WARN` to `FAIL` so AI hallucinations (e.g. `neck_pitch`, `legL_flex`) are immediately rejected.
- [ ] In `src/domain/validation/vrm10/check-vrm10.js`:
  - Change the bone check to test channels and humanoid bones actually used in the clip rather than querying the static 55-bone rig definition.
  - Correct the requirement terminology: VRM 1.0 mandates 15 humanoid bones (`REQUIRED_VRM_BONES`), while the remaining 40 bones are optional.
- [ ] Enrich validation messages with exact joint names, measured numerical values, limits, and timestamps across all rules (knee flexion, floor penetration, foot sliding).
- [ ] Re-evaluate `foot_slide: false` on locomotion clips (`walk.json`, `kick_*.json`) and introduce explicit foot contact time intervals (`windows.planted_L`, `windows.planted_R`).

### 0.6 Documentation & Repository Cleanliness
- [ ] In `README.md`, correct channel name references: replace `neck_pitch` with `head_pitch`, replace `legL_flex` with `legL_swing` / `kneeL`, and replace `invulnerable` with `inv`.
- [ ] Remove duplicate `bun.lock` (standardizing solely on canonical `package-lock.json` and `npm ci`).
- [ ] Add `.tempmediaStorage` and test caches to `.gitignore`.

---

## Milestone 1: AI Vision & Contact Sheet Exporter (ROADMAP Phase 1)

- [ ] Implement headless multi-frame pose strip renderer in `src/presentation/viewport/contact-sheet-renderer.js`.
- [ ] Support configurable frame count (e.g. 6 to 12 poses) with silhouette contrast mode.
- [ ] Overlay distal extremity motion arcs (hands, feet, head) directly on the contact sheet image.
- [ ] Add `Export Contact Sheet` button in the UI and expose `window.ClipKit.renderContactSheet(...)`.
- [ ] Format structured image metadata payload (timestamps, camera perspective, root bounding box) for multimodal AI agent prompt ingestion.

---

## Milestone 2: Automated Overlap & Kinetic Chain Engine (ROADMAP Phase 2)

- [ ] Create domain module `src/domain/animation/overlap-processor.js`.
- [ ] Implement hierarchical propagation delays:
  - Pelvis ($t_0$) $\rightarrow$ Spine ($t_0 + 30\text{ms}$) $\rightarrow$ Shoulders ($t_0 + 60\text{ms}$) $\rightarrow$ Wrists ($t_0 + 100\text{ms}$).
- [ ] Implement decaying sinusoidal overshoot calculator for settling phases (`outElastic` / damped oscillation).
- [ ] Add motion rhythm templates (`Anticipation -> Acceleration -> Overshoot -> Settle`).
- [ ] Add UI controls in Editor JSON panel to preview and bake procedural overlap non-destructively.

---

## Milestone 3: Inbound Ingestion & Inverse Solver (ROADMAP Phases 3, 4, 5)

### Phase 3: VRMA & Animated GLB Importer
- [ ] Implement `src/infrastructure/vrm/vrma-importer.js` to parse glTF animation tracks (`VRMC_vrm_animation`).
- [ ] Convert source rest orientations (A-pose to T-pose) and scale root displacements to model leg length.
- [ ] Implement drag-and-drop ingestion handler in UI for `.vrma` and `.glb` files.

### Phase 4: Inverse Semantic Solver & Keyframe Compressor
- [ ] Implement `src/domain/animation/inverse-solver.js` to derive semantic rotation channels (`lean`, `twist`, `armR_elev`, `armR_azim`, `kneeL`) from raw 3D bone orientation vectors.
- [ ] Implement Ramer-Douglas-Peucker (RDP) curve simplification with easing curve fitting (`linear`, `inOutSine`, `outQuad`).
- [ ] Output compression report displaying raw sample reduction count and angular loss metrics per joint.

### Phase 5: BVH Mocap Ingestion
- [ ] Implement `src/infrastructure/mocap/bvh-parser.js` for hierarchical ASCII BVH files.
- [ ] Add customizable bone alias dictionary (resolving Mixamo, Biped, and standard humanoid conventions).
- [ ] Implement automated root motion extraction and cyclic loop boundary detection.

---

## Milestone 4: Procedural Dynamics & Analytic Foot IK (ROADMAP Phase 6)

- [ ] Implement two-bone analytic foot IK solver in `src/domain/rig/foot-ik-solver.js` to firmly plant foot transforms during contact intervals.
- [ ] Add procedural idle micro-dynamics (thoracic breathing oscillation, weight shift, anticipatory eye saccades).
- [ ] Implement Center of Mass (CoM) floor polygon balance projection validator.
