import { vadd, vnorm, vscale } from '../math/vec3.js';
import { D2R, qarc, qaxis, qinv, qmul, qnorm, qrot } from '../math/quat.js';
import { rootMotion } from '../animation/root-motion.js';
import { evalChannels } from './rig-context.js';
import { evalExpressions } from '../validation/vrm10/expressions.js';

export function evalPose(rig, ctx, clip, t) {
  const cv = evalChannels(rig, ctx, clip, t),
    n = ctx.n;
  const G = new Array(n),
    local = new Array(n),
    pos = new Array(n);
  let hips = ctx.offsets[0].slice();
  const ps = ctx.posScale;
  for (const po of ctx.posOps) {
    hips = vadd(hips, vscale(po.axis, cv[po.ch] * ps));
  }
  const root = rootMotion(clip, t);

  for (let i = 0; i < n; i++) {
    const p = ctx.parents[i];
    const gp = p < 0 ? [0, 0, 0, 1] : G[p];
    let qd = [0, 0, 0, 1];

    for (const op of ctx.ops[i]) {
      if (op.kind === 'axis') {
        qd = qmul(qaxis(vnorm(qrot(gp, op.axis)), cv[op.ch] * D2R * op.w), qd);
      } else {
        const el = cv[op.name + '_elev'] * D2R,
          az = cv[op.name + '_azim'] * D2R,
          ro = cv[op.name + '_roll'] * D2R;
        const d = [
          op.lateral[0] * Math.cos(el) * Math.cos(az),
          Math.sin(el),
          Math.cos(el) * Math.sin(az)
        ];
        const dc = vnorm(qrot(gp, d)),
          rc = vnorm(qrot(gp, op.rest_dir));
        qd = qmul(qaxis(dc, ro), qmul(qarc(rc, dc), qd));
      }
    }

    G[i] = qnorm(qmul(qd, gp));
    local[i] = qnorm(qmul(qinv(gp), qmul(qd, gp)));
    pos[i] = p < 0 ? vadd(root, hips) : vadd(pos[p], qrot(gp, ctx.offsets[i]));
  }

  return { pos, delta: G, local, root, hips, cv, expr: evalExpressions(clip, t) };
}
