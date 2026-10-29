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

## Channel Catalog & Sign Conventions

### Torso & Spine
Rotations across the lumbar and thoracic spine are automatically distributed across `Spine` (0.4), `Spine1` (0.3), and `Spine2` (0.3):

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `lean` | Pitch ($X$) | $+$ bends forward, $-$ arches back | $-45^\circ .. +85^\circ$ |
| `side_lean` | Roll ($Z$) | $+$ tilts right, $-$ tilts left | $-40^\circ .. +40^\circ$ |
| `twist` | Yaw ($Y$) | $+$ turns right, $-$ turns left | $-60^\circ .. +60^\circ$ |
| `hip_yaw` | Yaw ($Y$) | Pelvis rotation relative to root | $-45^\circ .. +45^\circ$ |
| `hip_roll` | Roll ($Z$) | Pelvis lateral tilt | $-30^\circ .. +30^\circ$ |
| `hip_x`, `hip_y`, `hip_z` | Translation | Pelvis displacement in meters | $-2\text{m} .. +2\text{m}$ |

### Neck & Head
Head rotation is shared between `Neck` (0.4) and `Head` (0.6):

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `head_pitch` | Pitch ($X$) | $+$ looks down, $-$ looks up | $-40^\circ .. +50^\circ$ |
| `head_yaw` | Yaw ($Y$) | $+$ turns right, $-$ turns left | $-75^\circ .. +75^\circ$ |
| `head_roll` | Roll ($Z$) | $+$ tilts right, $-$ tilts left | $-35^\circ .. +35^\circ$ |

### Arms & Hands (Aim Spherical Solver)
Arm rotations use a decoupled spherical coordinate system (Elevation, Azimuth, Roll) to avoid gimbal lock:

| Channel Name | Description | Zero Position ($0^\circ$) | Sign Convention |
|---|---|---|---|
| `armR_elev`, `armL_elev` | Shoulder Elevation | Arm horizontal at shoulder level | $-80^\circ$ at sides, $+80^\circ$ raised straight up |
| `armR_azim`, `armL_azim` | Shoulder Azimuth | Arm pointing lateral/outward | $+90^\circ$ forward across chest, $-30^\circ$ backward |
| `armR_roll`, `armL_roll` | Axial Arm Twist | Neutral pronation/supination | $+$ rotates outward, $-$ rotates inward |
| `elbowR` | Right Elbow Flexion | Full extension ($0^\circ$) | $+Y$ axis: $+$ bends forearm toward bicep ($0^\circ .. +140^\circ$) |
| `elbowL` | Left Elbow Flexion | Full extension ($0^\circ$) | $-Y$ axis: $+$ bends forearm toward bicep ($0^\circ .. +140^\circ$) |
| `wristR_pitch`, `wristL_pitch` | Wrist Flexion | Neutral alignment | $+$ flexes palm, $-$ extends |

### Legs & Feet

| Channel Name | Axis / Motion | Sign Convention | Range |
|---|---|---|---|
| `legR_swing`, `legL_swing` | Hip Flexion/Extension | $+$ swings leg forward, $-$ reaches backward | $-30^\circ .. +110^\circ$ |
| `legR_abd`, `legL_abd` | Hip Abduction | $+$ spreads leg outward, $-$ pulls inward | $-15^\circ .. +50^\circ$ |
| `legR_twist`, `legL_twist` | Hip Axial Rotation | $+$ rotates outward, $-$ inward | $-40^\circ .. +40^\circ$ |
| `kneeR`, `kneeL` | Knee Flexion | $+$ bends lower leg back, negative is hyperextension | $0^\circ .. +150^\circ$ |
| `footR_pitch`, `footL_pitch` | Ankle Pitch | $+$ points toes down, $-$ points toes up | $-45^\circ .. +40^\circ$ |
| `footR_yaw`, `footL_yaw` | Ankle Yaw | Toe pointing direction | $-30^\circ .. +30^\circ$ |
