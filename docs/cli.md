# ClipKit Agent CLI Reference

The **ClipKit CLI** (`clipkit`) is a machine-first, deterministic command-line interface for humanoid animation authoring, validation, inspection, and compilation. It is designed for direct consumption by AI agents (e.g., Claude, Gemini, Cursor) as well as human animators and pipeline engineers.

---

## Installation & Execution

### Global or Local Path
The CLI binary is located at `bin/clipkit.mjs`:

```bash
# Direct node execution
node bin/clipkit.mjs <command> [options]

# Via npm script
npm run build:cli

# Global link (optional)
npm link
clipkit <command> [options]
```

### Global Options
- `-h, --help`: Display help and usage information.
- `-v, --version`: Print current CLI version (`clipkit v1.5.0`).
- `--json`: Output byte-identical, deterministic machine-readable JSON.

---

## Commands Summary

| Command | Purpose | Primary Options |
|---|---|---|
| `validate <clip>` | Validate kinematics against anatomical, physics, and VRM 1.0 rules | `--style`, `--fail-on`, `--json` |
| `check <clip>` | Run schema check, validation, and optional contact sheet together | `--sheet <dir>`, `--style`, `--json` |
| `schema <clip>` | Verify syntax and provide suggestions for misspelled channels | `--json` |
| `export <clip>` | Compile ClipKit JSON to binary `.vrma` container | `--out <file>` |
| `import <file>` | Ingest and decompile `.vrma`, `.glb`, or `.bvh` into ClipKit JSON | `--output <file>`, `--epsilon`, `--filter-jitter`, `--report` |
| `sheet <clip>` | Render headless SVG contact sheet with annotated kinematics | `--out <dir>`, `--frames <n>`, `--view <cam>` |
| `compose <clip>` | Flatten multi-layer animation into a single standalone clip | `--output <file>` |
| `compare <a> <b>` | Compare kinematics metrics and generate visual diff sheet | `--sheet <dir>`, `--json` |
| `edit <op> <clip>` | Perform deterministic edits (`mirror`, `retime`, `scale-amplitude`, `close-loop`, `foot-ik`, `micro-dynamics`) | `--output <file>`, `--scale <n>` |
| `version <clip>` | Create an immutable version snapshot with `manifest.json` | `--parent <v>`, `--note <text>`, `--force` |
| `poses <subcmd>` | Browse single-keyframe pose library (`list`, `show <name>`) | `--part <part>`, `--json` |
| `channels` | List available rig channels, ranges, and assigned body parts | `--part <part>`, `--json` |
| `rules` | List validation rule registry and stylistic limit thresholds | `--style <style>`, `--json` |

---

## Detailed Command Reference

### 1. `validate`
Evaluates forward kinematics at 30 FPS against registered validation rules:
```bash
clipkit validate src/data/clips/slash.json --style stylized --json
```

Output:
```json
{
  "valid": true,
  "style": "stylized",
  "failCount": 0,
  "warnCount": 0,
  "passCount": 19,
  "issues": []
}
```

### 2. `check`
Combined diagnostic tool that runs schema validation, kinematics rules, and optional headless visual contact sheet generation:
```bash
clipkit check src/data/clips/walk.json --sheet ./diagnostics --json
```

### 3. `export`
Compiles verified ClipKit JSON into an industry-standard binary glTF container with the `VRMC_vrm_animation` extension:
```bash
clipkit export src/data/clips/dodge.json --out dodge.vrma
```

### 4. `import`
Ingests external motion capture files or animated 3D models, runs inverse semantic solving, and applies easing curve simplification:
```bash
# Import BVH mocap
clipkit import mocap.bvh --output walk.json --filter-jitter --report

# Import VRMA animation
clipkit import emote.vrma --output emote.json --epsilon 0.5 --report
```

Telemetry output:
```text
--- Import & Keyframe Compression Telemetry ---
Raw Samples: 180
Compressed Keys: 46
Sample Reduction: 74.4%
Avg Angular Error: 0.85°
Max Channel Error: 2.12°
------------------------------------------------
Saved imported clip to walk.json (74.4% reduction)
```

### 5. `compose`
Flattens layered animation clips (with `override` and `additive` blending) into a single standalone clip:
```bash
clipkit compose src/data/clips/hero_combo.json --output hero_combo_flat.json
```

### 6. `compare`
Calculates differential metrics between two variant clips and generates side-by-side silhouette contact sheets:
```bash
clipkit compare variants/jump_v1.json variants/jump_v2.json --sheet ./comparison --json
```

### 7. `edit`
Executes deterministic mathematical transformations on animation clips:
```bash
# Mirror left and right limbs
clipkit edit mirror attack_r.json --output attack_l.json

# Retime duration by a factor
clipkit edit retime walk.json --scale 1.2 --output walk_slow.json

# Scale motion amplitude
clipkit edit scale-amplitude jump.json --scale 0.75 --output jump_soft.json

# Smooth start and end keyframes for seamless looping
clipkit edit close-loop idle.json --output idle_loop.json

# Analytic two-bone foot IK pinning to eliminate foot sliding
clipkit edit foot-ik walk.json --output walk_pinned.json

# Procedural idle micro-dynamics (breathing, subtle sway, eye saccades)
clipkit edit micro-dynamics idle.json --output idle_alive.json
```

### 8. `version`
Creates an immutable version in a clip folder and updates `manifest.json`:
```bash
clipkit version clips/jump.json --parent 1 --note "Floatier apex with delayed descent"
```
