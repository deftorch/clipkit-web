# ClipKit Animation DSL Specification

## 1. Top-Level Schema

A ClipKit animation is an immutable JSON object:

| Field | Type | Description |
|---|---|---|
| `name` | string | Identifier for the clip (e.g. `"slash"`, `"jump"`). |
| `format_version` | integer | DSL schema version. Use `1` or `2` (`2` supports `layers`). |
| `version` | integer | Incremental version number (>= 1). |
| `duration` | number | Total length in seconds (0 < duration <= 30.0). |
| `loop` | boolean | If `true`, the motion repeats seamlessly. |
| `changelog` | array | Array of `[{ v, catatan }]` documenting changes. |
| `channels` | object | Dictionary mapping channel names to keyframe arrays. |
| `expressions` | object | VRM 1.0 blend shape expressions (0.0 to 1.0). |
| `windows` | object | Gameplay timing intervals `[start, end]`. |
| `events` | array | Trigger cues `[{ t, id }]`. |
| `move` | array | Linear root displacement vector `[x, y, z]` in meters. |
| `claims` | object | Declared kinematic metrics for automated verification. |
| `layers` | array | Layer composition directives `[{ ref, channels, mode, offset }]`. |

---

## 2. Keyframes and Easings

A keyframe array consists of 2 or 3 elements: `[timestamp, value, easing?]`.

- `timestamp`: Float in seconds ($0 \le t \le \text{duration}$).
- `value`: Target value (degrees for rotation channels, meters for root displacements).
- `easing`: Optional interpolation easing function into this keyframe:
  - `"linear"`: Constant speed interpolation.
  - `"inQuad"`, `"outQuad"`, `"inOutQuad"`: Quadratic acceleration/deceleration.
  - `"inCubic"`, `"outCubic"`, `"inOutCubic"`: Cubic curve for weight and momentum.
  - `"inSine"`, `"outSine"`, `"inOutSine"`: Smooth harmonic transition.
  - `"outBounce"`: Bouncing settling effect for impacts and landings.
  - `"hold"`: Step function, retains previous value until this timestamp.

---

## 3. Gameplay Windows

Windows define frame-accurate gameplay interaction intervals:

- `"hitbox"`: Active attack strike frames.
- `"cancel"`: Attack recovery cancel window for chaining actions.
- `"parry"`: Active deflection or counter-window.
- `"inv"`: Invulnerability frames (iframes) during rolls, dodges, or jump apex.
- `"planted_L"`, `"planted_R"`: Intervals where the foot must remain locked to the floor.

---

## 4. Root Motion (`move`)

Defines cumulative world-space root translation across the clip duration:

```json
"move": [0, 0, 1.5]
```

- Component 0 ($X$): Lateral displacement (meters, positive = right).
- Component 1 ($Y$): Vertical displacement (meters, positive = up).
- Component 2 ($Z$): Forward displacement (meters, positive = forward).
