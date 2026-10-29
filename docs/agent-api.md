# ClipKit Programmatic Agent API Reference

The **ClipKit Agent API** (`window.clipkit`) provides a unified, headless-capable JavaScript interface for AI agents, test automation frameworks (Playwright, Puppeteer, Vitest), and custom toolchains to evaluate, manipulate, and export animations.

---

## Accessing the Agent API

In browser and web sandbox contexts, the API is mounted to the global window:

```javascript
// Access the unified agent API
const api = window.clipkit;
```

In headless Node.js testing environments, the factory function can be imported directly:

```javascript
import { createAgentApi } from './src/application/services/agent-api.js';

const api = createAgentApi({
  onExportVrma: (it, rig, ctx) => { ... },
  onImportVrma: (buffer, opts) => { ... },
  onImportBvh: (text, opts) => { ... },
  onRefreshAll: () => { ... },
  onRenderContactSheet: (rig, ctx, clip, opts) => { ... },
});
```

---

## Method Reference

### State & Clip Management

#### `api.getState()`
Returns a snapshot of the active application state:
```javascript
const { clip, playback } = api.getState();
```

#### `api.curItem()`
Returns the currently selected clip item object, including its text, validation results, and parsed clip data:
```javascript
const item = api.curItem();
console.log(item.clip.name, item.res.failCount);
```

#### `api.getClips()` / `api.getClip(id)`
Retrieves all registered clips or a specific clip by identifier:
```javascript
const allClips = api.getClips();
const slashClip = api.getClip('slash');
```

#### `api.setClip(id, content)`
Creates or updates a clip from a JSON string or clip object, formats it deterministically, and selects it:
```javascript
api.setClip('my_jump', myJumpJson);
```

#### `api.selectClip(id)`
Switches the active animation clip and synchronizes playback:
```javascript
api.selectClip('walk');
```

---

### Kinematics & Validation

#### `api.validate(clip, style?, rig?, ctx?)`
Runs the complete 8-rule validation registry against the specified clip:
```javascript
const result = api.validate(clipJson, 'stylized');

if (result.failCount > 0) {
  for (const issue of result.issues) {
    console.error(`[${issue.level}] ${issue.rule}: ${issue.hint}`);
  }
}
```

#### `api.evalPose(clip, t, rig?, ctx?)`
Evaluates 3D joint world positions and orientations at an exact timestamp $t$:
```javascript
const pose = api.evalPose(clipJson, 0.45);
const rightHandPos = pose.pos[11]; // [x, y, z] coordinates in meters
```

#### `api.rebuild(item?)`
Re-parses, re-validates, and rebuilds the current or specified clip item:
```javascript
api.rebuild();
```

---

### Inbound Ingestion & Export

#### `api.exportVrma(clip?, rig?, ctx?)`
Compiles a ClipKit JSON clip into a binary glTF `VRMC_vrm_animation` Blob or Uint8Array:
```javascript
const vrmaBlob = api.exportVrma(myClip);
```

#### `api.importVrma(buffer, options?)`
Decompiles a binary `.vrma` or `.glb` animation file into a sparse ClipKit JSON clip with telemetry:
```javascript
const { clip, telemetry } = api.importVrma(vrmaBuffer, { epsilon: 0.8 });
console.log(`Keyframes reduced by ${telemetry.reductionRatio}%`);
```

#### `api.importBvh(bvhText, options?)`
Ingests an ASCII BVH motion capture file:
```javascript
const { clip, telemetry } = api.importBvh(bvhString, { filterJitter: true });
```

#### `api.renderContactSheet(clip?, renderOpts?, rig?, ctx?)`
Renders a headless SVG contact sheet with annotated motion arcs and COM balance projection:
```javascript
const { svg, sidecar } = api.renderContactSheet(myClip, { frameCount: 8 });
```

---

### Transport & Playback Control

- `api.play()`: Starts animation playback.
- `api.pause()`: Pauses playback.
- `api.togglePlay()`: Toggles play/pause state.
- `api.seek(t)`: Sets playback playhead to timestamp $t$ (seconds).
- `api.stepFrame(n)`: Steps playback forward or backward by $n$ frames.
- `api.restart()`: Resets playhead to $t=0$.
- `api.refresh()`: Triggers full UI redraw.
