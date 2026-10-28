# Combat Motion & Gameplay Windows Reference

Responsive action animations (slashes, dodges, kicks, parries) require clear telegraphing and tightly bounded collision windows.

---

## 1. Attack Anatomy (The 4 Phases)

1. **Anticipation (Windup)**:
   - Body compresses, stores kinetic energy, and draws back the attacking limb.
   - Pacing: 25%–35% of total clip duration.
2. **Release (Strike Action)**:
   - Rapid explosive movement with maximum angular velocity.
   - Pacing: 10%–15% of clip duration (often 2–4 frames at 30 fps).
   - Window: `hitbox: [tStart, tEnd]`.
3. **Follow-Through & Apex Overshoot**:
   - The attacking limb passes the target line and decelerates with damped oscillation.
4. **Recovery**:
   - Weapon or limb returns to guard stance.
   - Window: `cancel: [tStart, duration]` permits early chaining into follow-up attacks or dodges.

---

## 2. Defensive Actions (Dodge & Parry)

- **Parry**:
   Defines an active counter window:
   ```json
   "windows": {
     "parry": [0.15, 0.35]
   }
   ```
   Requires a stable planted foot stance (`planted_L`, `planted_R`) to absorb impact force.
- **Dodge & Invulnerability (i-Frames)**:
   Defines an invulnerability window:
   ```json
   "windows": {
     "inv": [0.1, 0.45]
   }
   ```
   Typically accompanied by forward or lateral root motion (`move`).
