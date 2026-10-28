import { EASINGS, ease } from './animation/easing.js';
import { sampleKeys } from './animation/keyframes.js';
import { rootMotion } from './animation/root-motion.js';
import { qinv, qmul, qrot } from './math/quat.js';
import { vadd, vcross, vdot, vlen, vnorm, vscale, vsub } from './math/vec3.js';
import { evalPose } from './rig/pose-evaluator.js';
import {
  allChannelNames,
  channelDefault,
  channelRange,
  evalChannels,
  makeCtx,
  restPositions,
} from './rig/rig-context.js';
import { checkChannelRanges } from './validation/rules/channel-ranges.js';
import { versionIssues } from './validation/rules/version.js';
import { validate } from './validation/validator.js';
import { checkVrm10 } from './validation/vrm10/check-vrm10.js';
import { FPS, VRM10_BONES, VRM10_EXPRESSIONS } from './validation/vrm10/constants.js';
import { evalExpressions } from './validation/vrm10/expressions.js';

export const ClipKit = {
  VRM10_BONES,
  VRM10_EXPRESSIONS,
  evalExpressions,
  checkVrm10,
  FPS,
  ease,
  EASINGS,
  sampleKeys,
  rootMotion,
  makeCtx,
  evalPose,
  evalChannels,
  restPositions,
  validate,
  allChannelNames,
  channelDefault,
  channelRange,
  checkChannelRanges,
  versionIssues,
  qrot,
  qmul,
  qinv,
  vadd,
  vsub,
  vnorm,
  vlen,
  vdot,
  vcross,
};

export default ClipKit;
