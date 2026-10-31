# ClipKit Channels & Humanoid Rig Reference

ClipKit maps human-interpretable rotational and translational degrees of freedom to a standardized 55-bone humanoid rig compatible with **VRM 1.0** and **Godot 4.3**.

---

## Body Joint Hierarchy (22 of 55 Bones)

The Forward Kinematics engine evaluates all 55 animated bones. The 22 body joints below form the main kinematic chain; the remaining 33 bones (30 finger bones, 2 eyes, 1 jaw) hang off these joints and are driven by their own channels (see the finger, eye and jaw sections of the catalog):

```
Hips (Root)
 ├── Spine
 │    └── Spine1 (Chest)
 │         └── Spine2 (Upper Chest)
 │              ├── Neck
 │              │    └── Head
 │              ├── LeftShoulder
 │              │    └── LeftArm (Upper Arm)
 │              │         └── LeftForeArm (Lower Arm)
 │              │              └── LeftHand
 │              └── RightShoulder
 │                   └── RightArm (Upper Arm)
 │                        └── RightForeArm (Lower Arm)
 │                             └── RightHand
 ├── LeftUpLeg (Upper Leg)
 │    └── LeftLeg (Lower Leg)
 │         └── LeftFoot
 │              └── LeftToeBase
 └── RightUpLeg (Upper Leg)
      └── RightLeg (Lower Leg)
           └── RightFoot
                └── RightToeBase
```

---

## Coordinate Frame & Sign Conventions

The canonical model frame follows:
- **$+X$**: Character's **left**
- **$+Y$**: Up
- **$+Z$**: Character's **front**

---

## Channel Catalog & Sign Conventions

### Torso & Spine
Rotations across the lumbar and thoracic spine are automatically distributed across `Spine` (0.4), `Spine1` (0.3), and `Spine2` (0.3):

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `lean` | Pitch ($X$) | $+$ bends forward, $-$ arches back | $-30^\circ .. +60^\circ$ |
| `side_lean` | Roll ($Z$) | $+$ tilts to character's right, $-$ to left | $-35^\circ .. +35^\circ$ |
| `twist` | Yaw ($Y$) | $+$ turns chest to character's left, $-$ to right | $-60^\circ .. +60^\circ$ |
| `hip_pitch` | Pitch ($X$) | $+$ pelvis tilts forward | $-30^\circ .. +45^\circ$ |
| `hip_twist` | Yaw ($Y$) | $+$ pelvis turns to character's left | $-60^\circ .. +60^\circ$ |
| `hip_roll` | Roll ($Z$) | $+$ pelvis tilts to character's right | $-25^\circ .. +25^\circ$ |
| `hip_x` | Translation ($X$) | Pelvis offset (+ = character left, - = right) | $-1.5\text{m} .. +1.5\text{m}$ |
| `hip_y` | Translation ($Y$) | Pelvis vertical offset (+ = up, - = down) | $-0.6\text{m} .. +0.5\text{m}$ |
| `hip_z` | Translation ($Z$) | Pelvis depth offset (+ = forward, - = backward) | $-1.5\text{m} .. +1.5\text{m}$ |

### Neck & Head
Head rotation is shared between `Neck` (0.4) and `Head` (0.6):

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `head_pitch` | Pitch ($X$) | $+$ looks down (flexion), $-$ looks up | $-40^\circ .. +45^\circ$ |
| `head_yaw` | Yaw ($Y$) | $+$ turns head to character's left | $-70^\circ .. +70^\circ$ |

### Arms & Aim Spherical Solver
Arm directions use a decoupled spherical coordinate system (Elevation, Azimuth, Roll) to avoid gimbal lock:

| Channel Name | Description | Zero Position ($0^\circ$) | Sign Convention / Range |
|---|---|---|---|
| `armL_elev`, `armR_elev` | Shoulder Elevation | Arm horizontal at shoulder level | Range: $[-95^\circ .. 175^\circ]$ (default $-75^\circ$) |
| `armL_azim`, `armR_azim` | Shoulder Azimuth | $0^\circ = $ lateral/side | Range: $[-100^\circ .. 140^\circ]$ ($+90^\circ = $ forward) |
| `armL_roll`, `armR_roll` | Axial Arm Twist | Neutral pronation/supination | Range: $[-120^\circ .. 120^\circ]$ |
| `elbowL` | Left Elbow Flexion | Full extension ($0^\circ$) | Range: $[-5^\circ .. 150^\circ]$, $+$ bends forearm |
| `elbowR` | Right Elbow Flexion | Full extension ($0^\circ$) | Range: $[-5^\circ .. 150^\circ]$, $+$ bends forearm |

### Legs & Feet

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `legL_swing`, `legR_swing` | Hip Flexion/Extension | $+$ swings thigh forward, $-$ extends backward | $-45^\circ .. +120^\circ$ |
| `legL_abd`, `legR_abd` | Hip Abduction | $+$ opens thigh outward, $-$ pulls inward | $-30^\circ .. +60^\circ$ |
| `kneeL`, `kneeR` | Knee Flexion | $+$ bends lower leg back (knee flex) | $-5^\circ .. +150^\circ$ |
| `footL_pitch`, `footR_pitch` | Ankle Pitch | $+$ points toes down (plantarflexion), $-$ toes up | $-45^\circ .. +60^\circ$ |

### Hands & Fingers
Fingers control clench/fist (pitch) and spread (yaw):

| Channel Name | Description | Range | Sign Convention |
|---|---|---|---|
| `thumbL`, `thumbR` | Thumb flexion | $-20^\circ .. +95^\circ$ | $+$ flexes/curls into fist |
| `indexL`, `indexR` | Index finger flexion | $-20^\circ .. +95^\circ$ | $+$ flexes/curls into fist |
| `middleL`, `middleR` | Middle finger flexion | $-20^\circ .. +95^\circ$ | $+$ flexes/curls into fist |
| `ringL`, `ringR` | Ring finger flexion | $-20^\circ .. +95^\circ$ | $+$ flexes/curls into fist |
| `littleL`, `littleR` | Pinky finger flexion | $-20^\circ .. +95^\circ$ | $+$ flexes/curls into fist |
| `spreadL`, `spreadR` | Finger spread / splay | $-10^\circ .. +30^\circ$ | $+$ splays fingers outward |

### Face & Jaw

| Channel Name | Description | Range | Sign Convention |
|---|---|---|---|
| `eye_yaw` | Gaze direction yaw | $-35^\circ .. +35^\circ$ | $+$ looks to character's left |
| `eye_pitch` | Gaze direction pitch | $-30^\circ .. +30^\circ$ | $+$ looks upward |
| `jaw_open` | Jaw rotation | $0^\circ .. +35^\circ$ | $+$ opens mouth |

