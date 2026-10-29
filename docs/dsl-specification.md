# ClipKit Animation DSL Specification

The **ClipKit Domain-Specific Language (DSL)** is a declarative, human-readable, and machine-first JSON format designed specifically for LLM animation generation, kinematics validation, and compilation to binary VRMA.

---

## 1. Top-Level Schema

```json
{
  "name": "slash_horizontal",
  "format_version": 1,
  "version": 1,
  "changelog": [
    { "v": 1, "catatan": "Initial sword slash draft." }
  ],
  "duration": 0.8,
  "loop": false,
  "channels": { ... },
  "windows": { ... },
  "events": [ ... ],
  "move": [ ... ],
  "layers": [ ... ],
  "claims": { ... },
  "validate": { ... }
}
```

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Unique identifier for the clip. |
| `format_version` | integer | Yes | Schema specification version (currently `1`). |
| `version` | integer | No | Revision integer (incremented on versioned updates). |
| `changelog` | array | No | Array of objects `[{ v: 1, catatan: "..." }]` documenting revision history. |
| `duration` | number | Yes | Total duration of the clip in seconds ($0.05 \le \text{duration} \le 30.0$). |
| `loop` | boolean | Yes | Whether the animation is cyclic (`true` enforces loop continuity). |
| `channels` | object | Yes | Keyframe dictionary mapping channel names to sorted keyframe tuples. |
| `windows` | object | No | Active time intervals `[start_t, end_t]` for combat and contact mechanics. |
| `events` | array | No | Discrete event triggers `{ t, type, id }` for audio, VFX, or gameplay logic. |
| `move` | array | No | Explicit root motion translation segments. |
| `layers` | array | No | Multi-layer composition definitions. |

---

## 2. Keyframes & Easing Curves

Each entry in `channels` is an array of keyframes sorted monotonically by time $t$:

```json
"lean": [
  [0.0, 0],
  [0.3, 15, "inOutSine"],
  [0.8, 0, "outQuad"]
]
```

### Keyframe Tuple Structure
`[t, value, easing?]`
- `t` (number): Timestamp in seconds ($0 \le t \le \text{duration}$).
- `value` (number): Rotational angle in degrees, or translation distance in meters.
- `easing` (string, optional): Interpolation function applied from the current keyframe to the next keyframe. Defaults to `"linear"`.

### Supported Easing Functions
- `"linear"`: Direct constant velocity interpolation.
- `"inQuad"`, `"outQuad"`, `"inOutQuad"`: Quadratic acceleration and deceleration.
- `"inCubic"`, `"outCubic"`, `"inOutCubic"`: Cubic curves for pronounced weight and momentum.
- `"inOutSine"`: Harmonic sinusoidal easing for natural biological oscillations.
- `"outElastic"`: Decaying damped sinusoidal oscillation for organic settling phases.
- `"hold"`: Step function maintaining constant value until the next keyframe.

---

## 3. Semantic Channels Reference

Channels correspond to biomechanically decoupled degrees of freedom rather than raw Euler angles:

### Torso & Spine
- `lean`: Forward ($+$) and backward ($-$) spinal flexion. Distributed across Spine, Spine1, and Spine2.
- `side_lean`: Lateral spinal bending to the right ($+$) or left ($-$).
- `twist`: Torso axial rotation to the right ($+$) or left ($-$).

### Head & Neck
- `head_pitch`: Looking down ($+$) or up ($-$).
- `head_yaw`: Turning head to the right ($+$) or left ($-$).

### Arms & Hands
- `armR_elev`, `armL_elev`: Shoulder elevation ($0^\circ$ at horizontal, $-80^\circ$ at sides, $+80^\circ$ raised).
- `armR_azim`, `armL_azim`: Shoulder horizontal azimuth ($-30^\circ$ backward, $+90^\circ$ across chest).
- `armR_roll`, `armL_roll`: Axial arm rotation.
- `elbowR`, `elbowL`: Elbow flexion ($0^\circ$ extended, $+130^\circ$ fully flexed).
- `wristR_pitch`, `wristL_pitch`: Wrist flexion.
- Finger channels: `thumbR_flex`, `indexR_curl`, etc.

### Legs & Feet
- `legR_swing`, `legL_swing`: Hip forward flexion ($+$) and extension ($-$).
- `legR_abd`, `legL_abd`: Hip abduction away from center ($+$).
- `kneeR`, `kneeL`: Knee flexion ($0^\circ$ straight, $+140^\circ$ bent).
- `footR_pitch`, `footL_pitch`: Ankle dorsiflexion ($+$) and plantarflexion ($-$).

---

## 4. Gameplay Windows & Foot Contact

Gameplay windows define intervals `[start_t, end_t]` evaluated by validation rules and engine gameplay logic:

```json
"windows": {
  "hitbox": [0.30, 0.45],
  "cancel": [0.55, 0.80],
  "parry": [0.10, 0.25],
  "inv": [0.15, 0.35],
  "planted_L": [0.0, 0.4],
  "planted_R": [0.4, 0.8]
}
```

- `hitbox`: Active attack damage window.
- `cancel`: Safe recovery interval allowing input buffering.
- `inv`: Invulnerability frames during evasive maneuvers.
- `planted_L`, `planted_R`: Contact intervals where the foot must not slide on the ground plane ($< 0.05\text{ m}$ tolerance).

---

## 5. Modular Layer Composition

Animations can be composed dynamically from multiple layers:

```json
"layers": [
  {
    "ref": "walk.json",
    "channels": ["leg*", "foot*"],
    "mode": "override"
  },
  {
    "ref": "slash.json",
    "channels": ["armR_*", "elbowR"],
    "mode": "override",
    "offset": 0.1
  },
  {
    "ref": "fist_L",
    "channels": ["thumbL_*", "indexL_*"],
    "mode": "override"
  }
]
```

- `ref`: Reference to another clip JSON, pose library asset, or external file.
- `channels`: Array of channel names or glob expressions (`armR_*`, `*flex`).
- `mode`: `"override"` (replaces base values) or `"additive"` (accumulates relative offsets).
- `offset`: Temporal shift in seconds relative to base clip start.
