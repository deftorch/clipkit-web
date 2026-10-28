# Hand Posing and Finger Articulation Reference

ClipKit provides individual finger flexion controls and splay angles for both left and right hands.

---

## 1. Hand Rotation Channels

All angles in degrees:

| Channel | Description | Neutral | Fist Pose | Open Hand |
|---|---|---|---|---|
| `thumbL` / `thumbR` | Thumb opposition and curl | 0° | 50° | 0° |
| `indexL` / `indexR` | Index finger curl | 15° | 90° | 5° |
| `middleL` / `middleR` | Middle finger curl | 15° | 90° | 5° |
| `ringL` / `ringR` | Ring finger curl | 15° | 90° | 5° |
| `littleL` / `littleR` | Pinky finger curl | 15° | 90° | 5° |
| `spreadL` / `spreadR` | Lateral finger splay | 5° | 0° | 20° |

---

## 2. Anatomical Hand Principles

1. **Finger Cascades**:
   Fingers do not close in exact lockstep synchrony. The index finger typically curls first ($t_0$), followed by middle ($t_0 + 30\text{ms}$), ring ($t_0 + 50\text{ms}$), and pinky ($t_0 + 70\text{ms}$).
2. **Natural Relaxed Resting State**:
   Never leave all finger curls at flat 0°. A relaxed human hand naturally rests with knuckles slightly curled (10°–20°) and the thumb softly opposed.
3. **Firm Grip (Fist)**:
   A tight fist curls knuckles to 85°–95° with thumb wrapped across index and middle knuckles at 45°–55°.
