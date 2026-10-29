# ClipKit Validation Rules & Limits Matrix

ClipKit enforces biomechanical plausibility, motor physics, and engine export compliance via an automated **Validation Rule Registry**. Every clip is sampled at 30 FPS across forward kinematics to ensure realistic, believable motion.

---

## Validation Rule Modules

The linter evaluates 8 independent rule modules in `src/domain/validation/rules/`:

| Rule Code | Module File | Description | Target Issues |
|---|---|---|---|
| `angular-speed` | `angular-speed.js` | Measures inter-frame angular rotation rate (°/s) and angular acceleration spikes (°/s²). | Detects unnatural snapping, popping, and inhuman rotational speeds. |
| `anatomy` | `anatomy.js` | Enforces physiological joint range-of-motion limits. | Forbids knee and elbow hyperextension, shoulder disarticulation, and torso twisting beyond human limits. |
| `floor` | `floor.js` | Evaluates vertical height ($Y$) of foot and toe joints relative to ground plane ($Y=0$). | Flags floor penetration and floating feet during contact. |
| `root-motion` | `root-motion.js` | Analyzes pelvis translational displacement and velocity vectors. | Catches discontinuous teleportation or snapping between frames. |
| `windows` | `windows.js` | Validates time intervals (`hitbox`, `cancel`, `parry`, `inv`, `planted_L/R`). | Flags inverted intervals ($t_1 \le t_0$), out-of-bounds intervals ($t > \text{duration}$), or foot sliding during planted windows. |
| `loop` | `loop.js` | Compares initial frame ($t=0$) with final frame ($t=\text{duration}$). | Enforces pose and velocity continuity on cyclic clips (`loop: true`). |
| `vrm10` | `vrm10.js` | Checks standard VRM 1.0 humanoid bone mappings and rest orientations. | Ensures mandatory humanoid bones are present and T-pose rest alignments are preserved. |
| `version` | `version.js` | Tracks content hash differentials against release versions. | Warns when behavior keys change without an incremented version number and changelog entry. |

---

## Stylistic Threshold Matrix

Validation limits adapt to the artistic style of the project:

### 1. Angular Speed Limits (°/s)

| Joint / Body Part | Realistic | Stylized (Default) | Exaggerated |
|---|---|---|---|
| **Pelvis / Hips** | 360°/s | 540°/s | 900°/s |
| **Spine / Torso** | 400°/s | 600°/s | 1000°/s |
| **Neck & Head** | 450°/s | 720°/s | 1200°/s |
| **Shoulders / Upper Arms** | 600°/s | 900°/s | 1500°/s |
| **Elbows / Forearms** | 720°/s | 1200°/s | 2000°/s |
| **Wrists & Hands** | 900°/s | 1500°/s | 2500°/s |
| **Hips / Upper Legs** | 450°/s | 720°/s | 1200°/s |
| **Knees / Lower Legs** | 600°/s | 900°/s | 1600°/s |
| **Ankles & Feet** | 500°/s | 800°/s | 1400°/s |

### 2. Anatomical Limits

- **Elbow Flexion**: $0^\circ$ (full extension) to $+145^\circ$ (full flexion). Negative values indicate hyperextension (`FAIL`).
- **Knee Flexion**: $0^\circ$ (straight leg) to $+150^\circ$ (full bend). Negative angles indicate hyperextension (`FAIL`).
- **Torso Lean**: $-45^\circ$ (extension back) to $+85^\circ$ (flexion forward).
- **Torso Twist**: $-60^\circ$ to $+60^\circ$.
- **Torso Side Lean**: $-40^\circ$ to $+40^\circ$.

### 3. Contact & Floor Tolerances

- **Floor Penetration**: Maximum allowable penetration below ground plane is $0.02\text{ m}$ (sole thickness buffer). Penetration $> 0.05\text{ m}$ triggers `FAIL`.
- **Foot Sliding**: When `windows.planted_L` or `windows.planted_R` is active, total horizontal displacement of the planted ankle/toe must not exceed $0.05\text{ m}$. Displacement $> 0.08\text{ m}$ triggers `FAIL`.

---

## Structured Issue Format

When invoked with `--json`, ClipKit emits machine-readable diagnostics:

```json
{
  "level": "FAIL",
  "rule": "anatomy",
  "code": "ELBOW_HYPEREXTENSION",
  "channel": "elbowR",
  "joint": "RightForeArm",
  "t": 0.25,
  "value": -8.4,
  "limit": 0.0,
  "unit": "deg",
  "hint": "Increase elbowR keyframe value at t=0.25s to at least 0.0 deg to prevent hyperextension"
}
```

This structured model enables AI agents to parse the exact channel, timestamp, and recommended target value for deterministic self-correction.
