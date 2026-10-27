import motus from './rigs/motus.json';
import vrmSamplePatch from './rigs/vrm-sample.json';

export function loadRigs() {
  const vrmSample = {
    ...motus,
    ...vrmSamplePatch,
    rest: {
      parents: motus.rest.parents,
      offsets: vrmSamplePatch.rest.offsets,
    },
  };
  return {
    motus,
    vrm_sample: {
      rig: vrmSample,
      info: vrmSamplePatch.info,
    },
  };
}
