import limitsData from '../../data/limits.json';
import { defaultPoses } from '../../data/poses/index.js';
import { checkVrm10 } from '../../domain/validation/rules/vrm10.js';
import { validateSchema } from '../../domain/validation/schema-validator.js';
import { validate } from '../../domain/validation/validator.js';
import { snapshotLines } from './clip-snapshots.js';

/**
 * Validates JSON schema, executes domain validation, VRM 1.0 humanoid check,
 * and version snapshot comparison on a clip item.
 */
export function rebuild(it, rig, ctx, style = 'stylized') {
  it.clip = null;
  it.err = null;
  it.res = null;
  it.lines = [];
  it.schemaErrors = [];

  let c;
  try {
    c = JSON.parse(it.text);
  } catch (e) {
    it.err = 'JSON tidak terbaca: ' + e.message;
    return;
  }

  const schemaRes = validateSchema(c, rig);
  if (!schemaRes.valid) {
    const firstErr = schemaRes.errors[0];
    it.err = firstErr.hint ? `${firstErr.message} — ${firstErr.hint}` : firstErr.message;
    it.schemaErrors = schemaRes.errors;
    return;
  }

  if (c.format_version != null && (!Number.isInteger(c.format_version) || c.format_version < 1)) {
    it.err = 'format_version harus bilangan bulat >= 1.';
    return;
  }

  it.clip = c;
  if (rig && ctx) {
    it.res = validate(rig, ctx, limitsData, c, style, undefined, {
      resolveRef: (ref) => {
        if (!ref) return null;
        const clean = ref.replace(/^poses\//, '').replace(/\.json$/, '');
        return defaultPoses[clean] || null;
      },
    });
    it.lines = it.res.lines.concat(checkVrm10(rig, ctx, c), snapshotLines(c));
  } else {
    it.lines = [];
    it.res = null;
  }
}

export function rebuildAll(items, order, rig, ctx, style = 'stylized') {
  for (const id of order) {
    rebuild(items[id], rig, ctx, style);
  }
}
