# ClipKit Web — Implementation Task List

This document tracks all immediate fixes, quality hardening tasks, and roadmap milestone deliverables for ClipKit Web.

---

## Milestone 0: Critical Fixes & Quality Hardening (Priority)

### 0.1 Fix VRM Model Loading Crash
- [x] In `src/application/state/rig-store.js`, import `parseGlb` from `../../infrastructure/vrm/glb-parser.js` instead of calling `VrmRig.parseGlb` (which is undefined).
- [x] Verify that drag-and-drop and the file input button successfully parse binary GLB/VRM files without throwing `TypeError`.

### 0.2 Fix Mesh Lifecycle & UI Toggle Synchronization
- [x] Remove redundant duplicate call to `ensureMesh` in `loadVrmFile` (eliminate duplicate buffer copying).
- [x] Ensure that when `VrmView.load()` resolves asynchronously:
  - Set `playbackState.mesh = true` and `playbackState.skel = false`.
  - Trigger `viewportCtrl.syncToggles()` so the "Mesh" button in the 3D viewport enables and highlights.
  - Trigger `renderRig()` to update mesh polygon and object statistics.
  - Trigger `dirtyAll()` to immediately render the 3D mesh on canvas.
- [x] Add bounds or eviction policy to `MESHBUF` in `rig-store.js` to prevent unbounded memory growth when loading multiple 15MB+ VRM files.

### 0.3 Integrate `Deft.vrm` Sample Model & Automated Smoke Test
- [x] Relocate `Deft.vrm` from root to `public/models/deft.vrm` for client-side demo use, and create `tests/fixtures/deft.vrm` (or shared reference) for testing.
- [x] Add automated smoke test `tests/vrm-loading.test.js` to verify:
  - Reading a binary VRM 1.0 file.
  - Parsing GLB chunks with `parseGlb`.
  - Building rig with `buildRig` without exceptions.
  - Generating valid rig metadata (22/22 bones present).

### 0.4 Lock Numerical Precision (True Golden Pose Assertions)
- [x] In `tests/golden-pose.test.js`, replace shallow length checks (`expect(p0.pos.length).toBe(...)`) with exact coordinate assertions against Godot reference values (`[x, y, z]` joint positions within $0.09\text{ mm}$ tolerance).
- [x] Add a round-trip `.vrma` export test:
  - Export reference clips (`slash`, `dodge`, `walk`) to binary `.vrma`.
  - Parse the binary glTF output and verify animation samplers match source keyframes within $0.05^\circ$ angular error.

### 0.5 Harden Validator for AI Agent Generation
- [x] In `src/domain/validation/rules/channel-ranges.js`, elevate unknown channel names from `WARN` to `FAIL` so AI hallucinations (e.g. `neck_pitch`, `legL_flex`) are immediately rejected.
- [x] In `src/domain/validation/vrm10/check-vrm10.js`:
  - Change the bone check to test channels and humanoid bones actually used in the clip rather than querying the static 55-bone rig definition.
  - Correct the requirement terminology: VRM 1.0 mandates 15 humanoid bones (`REQUIRED_VRM_BONES`), while the remaining 40 bones are optional.
- [x] Enrich validation messages with exact joint names, measured numerical values, limits, and timestamps across all rules (knee flexion, floor penetration, foot sliding).
- [x] Re-evaluate `foot_slide: false` on locomotion clips (`walk.json`, `kick_*.json`) and introduce explicit foot contact time intervals (`windows.planted_L`, `windows.planted_R`).

### 0.6 Documentation & Repository Cleanliness
- [x] In `README.md`, correct channel name references: replace `neck_pitch` with `head_pitch`, replace `legL_flex` with `legL_swing` / `kneeL`, and replace `invulnerable` with `inv`.
- [x] Remove duplicate `bun.lock` (standardizing solely on canonical `package-lock.json` and `npm ci`).
- [x] Add `.tempmediaStorage` and test caches to `.gitignore`.

---

## Milestone Map (ROADMAP Track C is executed first)

| Milestone | ROADMAP | Summary |
|---|---|---|
| 0 | n/a | Critical fixes and quality hardening (done) |
| 1 | Phase C0 | Architecture hardening: rule registry, ports, enforced layers |
| 2 | Phase C1 (+ Phase 1) | Agent CLI, structured diagnostics, headless contact sheet |
| 3 | Phase C2 | Modular composition, branching variants, compare |
| 4 | Phase C3 | Agent skill packaging |
| 5 | Phase 2 | Overlap and kinetic chain engine |
| 6 | Phases 3, 4, 5 | VRMA/GLB importer, inverse solver, BVH ingestion |
| 7 | Phase 6 | Foot IK, procedural micro-dynamics, CoM validator |

The former Milestone 1 (AI Vision & Contact Sheet) is merged into Milestone 2, because a contact sheet that agents can use must render headless. Former Milestones 2-4 are renumbered 5-7.

---

## Milestone 1: Architecture Hardening (ROADMAP Phase C0, prerequisite for the CLI)

- [x] First: record `validate()` output (all lines and FAIL/WARN counts) for the 14 reference clips under each style (`realistic`, `stylized`, `exaggerated`) in `tests/fixtures/validation-baseline.json`, and add a test asserting it is reproduced exactly. The refactor below must keep it green.
- [x] Replace the monolithic `validate()` with a rule registry: each rule in `src/domain/validation/rules/*.js` exposes `check({ rig, clip, limits })` (angular-speed, anatomy, floor, root-motion, windows, loop, vrm10, version). `validate()` only runs the registered rules and merges results.
- [x] Add one unit test per rule.
- [x] Move `vrma-exporter.js` from `src/domain/validation/vrm10/` to `src/infrastructure/vrma/`.
- [x] Define ports in `src/application/ports/`: `ClipRepository`, `MeshRenderer` (`pose`, `render`), `MeshLoader` (`load`, `unload`), `RigLoader`.
- [x] Implement `ClipRepository` with `localStorage` in infrastructure; remove `localStorage` from `clip-store.js`.
- [x] Move DOM and `window` access out of `application/theme.js` into presentation; provide a constant palette usable without a DOM.
- [x] Remove imports of `infrastructure/` from `application/` (rig store) and `presentation/` (viewport controller); inject the implementations from `main.js`.
- [x] Reduce `main.js` to a composition root: move `drawScene` to `presentation/viewport/scene-renderer.js` and the frame loop to a playback controller.
- [x] Replace the hard-coded lists in `refreshAll()` and `setTab()` with a panel registry that panels register into.
- [x] Replace the `if/else` on channel type and the `switch` on easing with registries.
- [x] Split `clip-store.js` responsibilities: text formatting, version snapshots, rebuild pipeline (parse, schema check, validate), and selection.
- [x] `src/data/history.json`: do not simply delete the entries. It duplicates the behavior keys of every reference clip and feeds `snapshotLines()`; removing it would make all 14 clips report "not released". Replace the copies with a content hash per released version (or move the record into the variant manifest) and keep the version-bump check passing.
- [x] Replace the `window.ClipKit`, `window.VrmRig`, `window.VrmView` and `window.__clipkit` globals with one documented agent API.
- [x] Add `tests/architecture.test.js` that fails on forbidden imports (domain imports nothing outside domain; application imports domain only; infrastructure imports domain only; presentation imports application and domain). `src/main.js` and `src/cli/` are composition roots and may import any layer.
- [x] Update `CONTRIBUTING.md` once the boundary test exists (it currently lists the known deviations).

**Done when**: the golden-pose, VRM and round-trip tests pass unchanged, the boundary test passes, and `npm run build` still produces a single-file bundle.

---

## Milestone 2: Agent CLI & Structured Diagnostics (ROADMAP Phase C1, absorbs Phase 1)

### Diagnostics
- [x] Structured issue model `{ level, rule, channel, joint, t, value, limit, unit, keys, hint }` with stable rule codes; keep the text lines for the UI.
- [x] Compute actionable `hint` values (for example minimum key spacing for a speed limit, maximum amplitude for a joint).
- [x] Run schema validation first, reporting the location of the problem and "did you mean" suggestions for unknown channel names (for example `neck_pitch` to `head_pitch`).
- [x] Decide the canonical message language (see ROADMAP Open Decisions); rule codes are language-neutral either way.

### Commands and contract
- [x] `bin` entry in `package.json` and commands: `check`, `validate`, `schema`, `channels --part <part>`, `rules`, `export`, `sheet`.
- [x] `--help` on every command with one example.
- [x] Non-interactive contract: exit codes `0` pass, `1` validation failures, `2` usage or unreadable input, `3` internal error.
- [x] Options `--json`, `--fail-on warn|fail`, `--max-issues`, and `-` for stdin/stdout.
- [x] Deterministic output: no timestamps, no network, byte-identical JSON for identical input.
- [x] Compact default output: summary first, issues sorted by severity, repeated issues grouped with a count; per-frame data only with `--verbose`.
- [x] `--part face|hands|arms|legs|torso` runs only the relevant rules.
- [x] Output policy: write files only into explicitly named directories, refuse paths outside the working directory unless `--allow-outside`, never overwrite without `--force`.
- [x] Declare `engines` in `package.json` consistent with the Node version stated in the README.

### Headless contact sheet (former Milestone 1)
- [x] Headless renderer reusing `drawFigure`, `drawTrails` and `drawTimeline` with a Node canvas implementation; SVG fallback if the native canvas is unavailable.
- [x] Configurable frame count (6 to 12 poses) with silhouette contrast mode and multi-view output.
- [x] Annotations inside the image: frame timestamps, gameplay window bands (`hitbox`, `cancel`, `parry`, `inv`), distal motion arcs (hands, feet, head), grid scale.
- [x] Fixed camera and scale so two variants are directly comparable.
- [x] JSON metadata sidecar: frame timestamps, camera, root travel and bounding box.
- [x] `Export Contact Sheet` button in the UI and `renderContactSheet(...)` on the agent API.
- [x] Combined command `check <clip> --sheet <dir> --json` returning a compact summary and absolute image paths.

### Packaging
- [x] Bundle the CLI as a single file without three.js and record a start-up time budget.
- [x] CLI golden tests asserting JSON output and sheet metadata (not pixels).

**Done when**: an agent can run one command on a clip and receive structured issues plus an annotated image, and the same clip always yields identical JSON.

---

## Milestone 3: Modular Composition & Variants (ROADMAP Phase C2)

- [x] `src/data/parts.json`: partition every channel, `expressions`, `aims` and `move` into face, hands, arms, torso, legs and root.
- [x] Add `layers: [{ ref, channels, mode, offset }]` to the clip schema (`channels` supports globs; `mode` is `override` or `additive`); decide `format_version` (see ROADMAP Open Decisions).
- [x] `src/domain/animation/compose.js`: a pure `composeClips()` returning an ordinary clip.
- [x] WARN when two layers write the same channel; require `additive` mode for shared torso channels.
- [x] Validate each layer with only its relevant rules, then validate the composite as a whole.
- [x] Variants: a folder per clip with immutable versions and a `manifest.json` (`parent`, `note`, metrics).
- [x] `clipkit version <clip> --parent <v> --note "..."` creates a child version and refuses to overwrite without `--force`.
- [x] `clipkit compare a b`: per-joint metric differences (peak angular speed, airtime, root travel, FAIL/WARN counts) plus a side-by-side image with differently colored motion arcs.
- [x] Deterministic edit operations: `mirror`, `retime`, `scale-amplitude`, `close-loop`.
- [x] `clipkit compose <clip>` flattens layers into a normal clip.
- [x] Add `layers` to `behaviorKeys` in `src/data/keys.json` so the version diff and the behavior-change check see layer edits.
- [x] Write and review the per-field merge semantics (channels, aims, positions, windows, events, move, expressions, duration) before implementing `composeClips()`; add one test per rule (ROADMAP Open Decision 6).
- [x] `mirror`: implement the rule table in ROADMAP C2.6 (swap L/R; negate `side_lean`, `twist`, `hip_twist`, `hip_roll`, `head_yaw`, `hip_x` and aim `_roll`; keep the rest), including expression and `planted_L`/`planted_R` swapping.
- [x] Mirror tests: `mirror(mirror(clip))` equals `clip`, and joint positions equal their reflection within 1e-4 m on a set of poses.
- [x] Pose library: `src/data/poses/*.json` (single-keyframe poses tagged by part), `ref` support in layers, and `clipkit poses list|show`.
- [x] UI: variant tree or switcher and an A/B overlay in the viewport.

**Done when**: a jump clip, a punch-arm layer and a face layer compose into one clip that validates and exports to `.vrma`, and two variants of the jump can be compared by metrics and image without losing either.

---

## Milestone 4: Agent Skill Packaging (ROADMAP Phase C3)

- [x] `skills/clipkit/SKILL.md` with a pushy trigger description and workflow rules: one body part per task, one variant per request, validate and look at the sheet every iteration, never overwrite versions, compose last.
- [x] References: `dsl.md`, `channels.md` (generated from the rig JSON), `validation-fixes.md`, `face.md`, `hands.md`, `locomotion.md`, `combat.md`, `animation-principles.md`.
- [x] `assets/examples/`: three to four reference clips that pass validation.
- [x] `npm run build:skill`: bundle the CLI into `scripts/clipkit.mjs` and regenerate the generated references.
- [x] Staged release: v0 needs only Milestone 2 `validate` and `export`; v1 adds `sheet` and per-part references; v2 adds `compare`, variants and `compose`.
- [x] Evals: "make a jump" (zero FAIL, saved as a new version), "make a floatier variant" (new child version, parent untouched), "add an angry face to this clip" (only face channels change).
- [x] Package as a `.skill` file and document the `.claude/skills/` setup for repository-based use.

**Done when**: the evals pass with the skill and measurably better than without it, and the skill's generated references match the code.


---

## Milestone 5: Automated Overlap & Kinetic Chain Engine (ROADMAP Phase 2)

- [x] Create domain module `src/domain/animation/overlap-processor.js`.
- [x] Implement hierarchical propagation delays:
  - Pelvis ($t_0$) $\rightarrow$ Spine ($t_0 + 30\text{ms}$) $\rightarrow$ Shoulders ($t_0 + 60\text{ms}$) $\rightarrow$ Wrists ($t_0 + 100\text{ms}$).
- [x] Implement decaying sinusoidal overshoot calculator for settling phases (`outElastic` / damped oscillation).
- [x] Add motion rhythm templates (`Anticipation -> Acceleration -> Overshoot -> Settle`).
- [x] Add UI controls in Editor JSON panel to preview and bake procedural overlap non-destructively.
- [x] Expose overlap as a deterministic CLI operation and as a layer effect (see Milestone 3).

---

## Milestone 6: Inbound Ingestion & Inverse Solver (ROADMAP Phases 3, 4, 5)

### Phase 3: VRMA & Animated GLB Importer
- [x] Implement `src/infrastructure/vrma/vrma-importer.js` (beside the exporter moved in Milestone 1) to parse glTF animation tracks (`VRMC_vrm_animation`).
- [x] Convert source rest orientations (A-pose to T-pose) and scale root displacements to model leg length.
- [x] Implement drag-and-drop ingestion handler in UI for `.vrma` and `.glb` files.

### Phase 4: Inverse Semantic Solver & Keyframe Compressor
- [x] Implement `src/domain/animation/inverse-solver.js` to derive semantic rotation channels (`lean`, `twist`, `armR_elev`, `armR_azim`, `kneeL`) from raw 3D bone orientation vectors.
- [x] Implement a zero-phase jitter filter on the semantic channels before reduction (per-part cutoff; do not smooth across `hold` easings or window boundaries) and report residual noise per channel.
- [x] Implement Ramer-Douglas-Peucker (RDP) curve simplification with easing curve fitting (`linear`, `inOutSine`, `outQuad`).
- [x] Output compression report displaying raw sample reduction count and angular loss metrics per joint.

### Phase 5: BVH Mocap Ingestion
- [x] Implement `src/infrastructure/mocap/bvh-parser.js` for hierarchical ASCII BVH files.
- [x] Add customizable bone alias dictionary (resolving Mixamo, Biped, and standard humanoid conventions).
- [x] Implement automated root motion extraction and cyclic loop boundary detection.

---

## Milestone 7: Procedural Dynamics & Analytic Foot IK (ROADMAP Phase 6)

- [ ] Implement two-bone analytic foot IK solver in `src/domain/rig/foot-ik-solver.js` to firmly plant foot transforms during contact intervals.
- [ ] Share one definition of "planted" between the foot-slide rule and the IK solver (a domain helper reading `windows.planted_L`/`planted_R`); the foot-slide check must pass on clips with planted windows after IK.
- [ ] Add procedural idle micro-dynamics (thoracic breathing oscillation, weight shift, anticipatory eye saccades).
- [ ] Implement Center of Mass (CoM) floor polygon balance projection validator as a new rule module in the validation rule registry (Milestone 1).
