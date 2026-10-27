import ClipKit from "../../domain/clipkit.js";

export const VIEWS = {
  front: [0, 0.05],
  side: [Math.PI / 2, 0.05],
  top: [0, 1.45],
  q: [0.62, 0.2]
};

export const cameraState = {
  yaw: 0.62,
  pitch: 0.2,
  dist: 4.4,
  target: [0, 0.9, 0.3]
};

const listeners = new Set();
export function onCameraChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn(cameraState);
}

export function camBasis() {
  const { yaw, pitch, dist, target } = cameraState;
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);

  const eye = [
    target[0] + dist * sy * cp,
    target[1] + dist * sp,
    target[2] + dist * cy * cp
  ];

  const f = ClipKit.vnorm(ClipKit.vsub(target, eye));
  let r = ClipKit.vcross(f, [0, 1, 0]);
  if (ClipKit.vlen(r) < 1e-4) r = [1, 0, 0];
  r = ClipKit.vnorm(r);
  const u = ClipKit.vcross(r, f);

  return { eye, f, r, u };
}

export function prj(p, W, H, KF, B) {
  const d = ClipKit.vsub(p, B.eye);
  const z = ClipKit.vdot(d, B.f);
  if (z < 0.05) return null;
  return [
    W / 2 + (ClipKit.vdot(d, B.r) / z) * KF,
    H / 2 - (ClipKit.vdot(d, B.u) / z) * KF,
    z
  ];
}

export function fitCamera(it) {
  if (!it || !it.res) return;
  let mx = 0, mz = 0, ext = 0;
  for (const P of it.res.poses) {
    mx += P.root[0];
    mz += P.root[2];
  }
  mx /= it.res.poses.length;
  mz /= it.res.poses.length;
  for (const P of it.res.poses) {
    ext = Math.max(ext, Math.hypot(P.root[0] - mx, P.root[2] - mz));
  }
  cameraState.target = [mx, 0.9, mz];
  cameraState.dist = Math.max(3.4, 3.2 + ext * 1.5);
  notify();
}

export function lerpTarget(it, rig, ctx, t) {
  if (!it || !it.clip) return;
  const P = ClipKit.evalPose(rig, ctx, it.clip, t);
  const h = P.pos[0];
  cameraState.target = [
    cameraState.target[0] + (h[0] - cameraState.target[0]) * 0.2,
    0.9,
    cameraState.target[2] + (h[2] - cameraState.target[2]) * 0.2
  ];
  notify();
}

export function setPresetView(k) {
  if (!VIEWS[k]) return;
  [cameraState.yaw, cameraState.pitch] = VIEWS[k];
  notify();
}
