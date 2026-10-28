# Locomotion Kinematics Reference (Walk, Run, Jump)

Natural bipedal locomotion requires balancing ground contact intervals, pelvis translation, and spine counter-rotation.

---

## 1. Locomotion Phases (Gait Cycle)

1. **Heel Strike (Contact)**:
   - Leading leg swings forward (`legL_swing` = +25°), knee almost straight (`kneeL` = 10°–15°), ankle dorsiflexed (`footL_pitch` = +10°).
   - Pelvis reaches its lowest height (`hip_y` drops ~3–5 cm).
2. **Passing Position (Mid-Stance)**:
   - Weight shifts over the planted foot; pelvis reaches its highest height (`hip_y` rises).
   - Trailing foot lifts off the ground and swings forward with bent knee (`kneeR` = 45°–60°).
3. **Toe Off (Push-Off)**:
   - Planted foot rolls onto toes (`footL_pitch` = -20°); trailing leg prepares for next contact.
4. **Flight Phase (Running / Jumping)**:
   - Both feet leave the floor; airtime occurs.

---

## 2. Pelvis and Torso Mechanics

- **Pelvis Tilt (`hip_roll`)**: When weight is supported by the left leg, the pelvis tilts slightly downwards towards the swinging right side ($-3^\circ$ to $-5^\circ$).
- **Torso Counter-Twist (`twist`)**: The chest twists in the opposite direction of pelvis yaw to maintain forward sightline and rotational balance.
- **Side Lean (`side_lean`)**: The spine leans gently toward the stance foot to keep the center of mass above the support polygon.

---

## 3. Planted Windows & Sliding Elimination

Always define `windows.planted_L` and `windows.planted_R` during the stance phase:

```json
"windows": {
  "planted_L": [0.05, 0.45],
  "planted_R": [0.55, 0.95]
}
```

During planted intervals, keep the foot bone world-space position completely stationary.
