---
name: clipkit
description: Author, edit, compose, validate, inspect, and export humanoid character animations in ClipKit JSON DSL and binary VRMA format (VRM 1.0 animation). Trigger whenever the user asks to create an animation, author humanoid motion (jump, attack, slash, walk, kick, emote, dodge, dance, combat, idle), adjust keyframes, fix anatomical/physics validation errors, inspect silhouettes and motion arcs, compose layered body parts, or branch and compare animation variants.
---

# ClipKit Animation Skill

ClipKit is a human-readable, machine-first humanoid animation system for VRM 1.0 avatars. Animations are authored in pure JSON and evaluated through forward kinematics against an anatomical and physics rule registry.

## Core Agent Workflow Principles

To produce reliable, biologically plausible animations without degradation:

1. **One Body Part Per Task**:
   Do not author all joints simultaneously. Focus on one part (`legs`, `torso`, `arms`, `hands`, `face`, or `root`) using `--part <part>`. Use layers to combine them.
2. **One Variant Per Request**:
   Create a specific child version for each distinct intent ("floatier", "heavier", "snappier") with `clipkit version <clip> --parent <v> --note "..."`.
3. **Inspect and Validate Every Iteration**:
   Run `clipkit check <clip> --sheet ./out --json` on every change. Read the structured issue list and visually review the contact sheet before making the next adjustment.
4. **Never Overwrite Parent Versions**:
   Keep previous versions immutable. If a variant fails or looks worse, branch from a known good parent.
5. **Compose Last**:
   Author base motion, arm layers, and facial overlays in separate clips or poses, then flatten them using `clipkit compose`.

---

## Command Reference

The bundled CLI script is located at `scripts/clipkit.mjs` (or `bin/clipkit.mjs` in the repository root).

```bash
# Validate animation physics and syntax
node scripts/clipkit.mjs validate <clip.json> --json

# Run validation, schema check, and render contact sheet together
node scripts/clipkit.mjs check <clip.json> --sheet ./out --json

# List rig channels, limits, and parts
node scripts/clipkit.mjs channels --part arms

# Browse single-keyframe pose library
node scripts/clipkit.mjs poses list
node scripts/clipkit.mjs poses show fist_L

# Perform deterministic edits
node scripts/clipkit.mjs edit mirror <clip.json> --output mirrored.json
node scripts/clipkit.mjs edit retime <clip.json> --scale 1.2 --output slower.json
node scripts/clipkit.mjs edit scale-amplitude <clip.json> --scale 0.8 --output subtle.json
node scripts/clipkit.mjs edit close-loop <clip.json> --output loop.json

# Flatten layers into a standalone clip
node scripts/clipkit.mjs compose <clip_with_layers.json> --output composed.json

# Compare two clips and generate side-by-side contact sheet
node scripts/clipkit.mjs compare <clipA.json> <clipB.json> --sheet ./out --json

# Create an immutable variant version in a clip folder
node scripts/clipkit.mjs version <clip.json> --parent 1 --note "Floatier apex"

# Export to binary .vrma (VRMC_vrm_animation-1.0)
node scripts/clipkit.mjs export <clip.json> --out animation.vrma
```

---

## ClipKit JSON DSL Quick Guide

A ClipKit animation is a standard JSON file:

```json
{
  "name": "jump",
  "format_version": 2,
  "version": 1,
  "duration": 0.9,
  "loop": false,
  "changelog": [
    { "v": 1, "catatan": "Initial base jump animation." }
  ],
  "channels": {
    "hip_y": [[0, 0.9], [0.35, 0.75, "inQuad"], [0.55, 1.35, "outQuad"], [0.9, 0.9, "outBounce"]],
    "lean": [[0, 0], [0.35, 18, "inOutSine"], [0.55, -5, "outQuad"], [0.9, 0, "inOutSine"]],
    "armR_elev": [[0, -70], [0.35, -80, "inQuad"], [0.55, 45, "outQuad"], [0.9, -70, "inOutSine"]]
  },
  "windows": {
    "inv": [0.35, 0.65],
    "planted_L": [0, 0.3],
    "planted_R": [0, 0.3]
  },
  "events": [
    { "t": 0.35, "id": "takeoff" },
    { "t": 0.55, "id": "apex" },
    { "t": 0.75, "id": "landing" }
  ],
  "move": [0, 0, 1.5]
}
```

### Layer Composition

Clips can define modular layers:

```json
{
  "name": "jump_with_punch",
  "format_version": 2,
  "duration": 0.9,
  "channels": { ... },
  "layers": [
    {
      "ref": "punch_arm_R",
      "channels": ["armR_*", "elbowR"],
      "mode": "override",
      "offset": 0.4
    },
    {
      "ref": "face_angry",
      "mode": "override"
    }
  ]
}
```

- `mode`: `"override"` replaces base keyframes; `"additive"` sums degrees/displacements.
- `channels`: Accepts exact names or wildcard globs like `"armR_*"`.
- `offset`: Shifts layer timing in seconds.

---

## Detailed References

- [DSL Specification](references/dsl.md): Complete DSL schema, keyframes, easings, windows, and events.
- [Rig Channels & Limits](references/channels.md): Full list of rotation channels, ranges, and body parts.
- [Validation Rules & Thresholds](references/rules.md): Diagnostic rule codes, physics limits, and severity thresholds.
- [Validation Fixes](references/validation-fixes.md): How to fix angular speed, floor penetration, foot sliding, and loop errors.
- [Facial Animation](references/face.md): VRM 1.0 expressions, eyes, and jaw control.
- [Hand Poses](references/hands.md): Finger flexion and gripping postures.
- [Locomotion](references/locomotion.md): Ground contact, weight shifting, and root motion.
- [Combat Motion](references/combat.md): Hitboxes, anticipation, parry, and recovery windows.
- [Animation Principles](references/animation-principles.md): Applying classic animation timing to 3D avatars.

