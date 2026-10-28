# Validation Errors and Recommended Fixes

When `clipkit validate` or `clipkit check` emits `FAIL` or `WARN` diagnostics, use the actionable guidance below to resolve them.

---

## 1. `SPEED_LIMIT` (Angular Speed Exceeded)
- **Cause**: A bone rotates too rapidly between consecutive frames, causing robotic snapping or unrealistic twitching.
- **Diagnostics Field**: `joint`, `t`, `value` (measured °/s), `limit` (max °/s).
- **Fix**:
  1. Increase keyframe spacing near timestamp `t`: spread keys apart by at least `value / limit` seconds.
  2. Reduce rotation amplitude or use `"inOutSine"` / `"outQuad"` easing rather than steep linear slopes.

---

## 2. `FLOOR_PENETRATION`
- **Cause**: Feet or toes dip below the floor baseline ($Y < \text{floorY}$).
- **Diagnostics Field**: `t`, `value` (meters penetration).
- **Fix**:
  1. Raise pelvis `hip_y` at timestamp `t`.
  2. Adjust knee flexion (`kneeL`, `kneeR`) or ankle pitch (`footL_pitch`, `footR_pitch`) so feet do not extend past the floor plane.

---

## 3. `FOOT_SLIDE`
- **Cause**: Character's foot slides horizontally during an active `planted_L` or `planted_R` window.
- **Diagnostics Field**: `joint`, `value` (meters drifted during contact).
- **Fix**:
  1. Synchronize pelvis root translation `hip_z` or `move` with leg stride during the planted phase.
  2. Ensure foot rotation and leg swing remain stationary during the planted interval.

---

## 4. `LOOP_MISMATCH`
- **Cause**: Clip has `"loop": true`, but the initial pose ($t=0$) does not match the final pose ($t=\text{duration}$).
- **Fix**:
  1. Run `clipkit edit close-loop <clip.json>` to copy starting keyframe values to the final keyframe automatically.
  2. Ensure root orientation and joint angles match at $t=0$ and $t=\text{duration}$.

---

## 5. `ANATOMY_KNEE` / `ANATOMY_ELBOW`
- **Cause**: Hinge joints hyperextended backwards (e.g. knee angle $< 0^\circ$ or elbow bent unnaturally).
- **Fix**:
  1. Knees only bend backwards: $0^\circ \le \text{knee} \le 160^\circ$.
  2. Elbows only bend inwards: $0^\circ \le \text{elbow} \le 150^\circ$.
