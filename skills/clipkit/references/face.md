# Facial Animation and Expressions Reference

ClipKit maps facial animation directly to standard VRM 1.0 expression blend shapes and head/eye rotation channels.

---

## 1. Physical Facial Channels

- `head_pitch`: Forward/backward head tilt ($-45^\circ$ to $+45^\circ$, positive = downward).
- `head_yaw`: Left/right head rotation ($-70^\circ$ to $+70^\circ$, positive = turn left).
- `eye_pitch`: Gaze elevation ($-20^\circ$ to $+20^\circ$, positive = looking down).
- `eye_yaw`: Gaze direction ($-30^\circ$ to $+30^\circ$, positive = looking left).
- `jaw_open`: Jaw opening angle ($0^\circ$ to $35^\circ$).

---

## 2. Standard VRM 1.0 Expression Presets

Values range continuously from `0.0` (neutral) to `1.0` (full weight).

### Emotion Presets
- `happy`: Warm smiling expression, raised cheeks.
- `angry`: Furrowed brows, narrowed eyes.
- `sad`: Downturned lips, angled brows.
- `relaxed`: Gentle, at-ease resting expression.
- `surprised`: Wide open eyes, raised brows.

### Eye Blinks & Gaze
- `blink`: Simultaneous bilateral eyelid closure.
- `blinkLeft`: Left eyelid wink.
- `blinkRight`: Right eyelid wink.
- `lookUp`, `lookDown`, `lookLeft`, `lookRight`: Standard eye tracking morphs.

### Visemes (Lip Sync)
- `aa`, `ih`, `ou`, `ee`, `oh`: Phoneme vowel mouth shapes.

---

## 3. Best Practices

- **Anticipatory Blinks**: Characters should blink prior to major head rotations or after intense exertion (e.g., landing from a jump).
- **Subtle Combinations**: Blend 0.7 `happy` with 0.1 `surprised` for delighted expressions. Avoid locking expressions at 1.0 permanently.
