# Classic Animation Principles for 3D Humanoids

Applying traditional animation principles prevents robotic, stiff, or lifeless humanoid motion in ClipKit.

---

## 1. Squash and Stretch
- In 3D humanoids, volume is preserved by bending knees, flexing ankles, and compressing the spine rather than scaling mesh geometry.
- Prior to a jump, squash the body down by dropping `hip_y` and bending knees (`kneeL`, `kneeR`). At launch, stretch by extending legs and arching the torso.

---

## 2. Anticipation
- Prepare the audience and physics for action. A character cannot jump forward without crouching backward first. A punch cannot strike with power without pulling the elbow and torso back first.

---

## 3. Staging and Readability (Silhouettes)
- Poses must be instantly readable from the player camera perspective.
- Use `clipkit sheet <clip> --silhouette` to audit figure readability against dark contrast. Avoid overlapping arms across the chest when distinct weapon or hand silhouettes are critical.

---

## 4. Overlapping Action & Drag
- Different body parts move at different rates:
  1. Pelvis / Root moves first ($t_0$).
  2. Spine and shoulders follow ($t_0 + 30\text{ms}$).
  3. Elbows and wrists drag behind ($t_0 + 60\text{ms}$).
  4. Loose extremities (hair, clothing, fingers) settle last.

---

## 5. Arcs
- Organic human movement travels along curvilinear trajectories, never straight geometric lines.
- Inspect distal motion arcs (hands, feet, head) using `clipkit sheet` to verify smooth parabolic curves without abrupt sharp corners.
