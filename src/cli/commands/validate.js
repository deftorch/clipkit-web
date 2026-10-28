import limitsData from '../../data/limits.json';
import { loadRigs } from '../../data/load-rigs.js';
import partsData from '../../data/parts.json';
import { makeCtx } from '../../domain/rig/rig-context.js';
import { validate } from '../../domain/validation/validator.js';
import { formatDeterministicJson, readInput } from '../io.js';

export function runValidate(args, options = {}) {
  const inputPath = args[0];
  if (!inputPath) {
    throw new Error('Usage: clipkit validate <clip-file> [options]');
  }

  const raw = readInput(inputPath);
  let clip;
  try {
    clip = JSON.parse(raw);
  } catch (e) {
    console.error(`Error: Unreadable JSON input: ${e.message}`);
    return 2;
  }

  const { motus } = loadRigs();
  const ctx = makeCtx(motus);
  const style = options.style || 'stylized';
  const failOn = options.failOn || 'fail'; // 'fail' | 'warn'

  const res = validate(motus, ctx, limitsData, clip, style, undefined, {
    part: options.part,
    parts: partsData,
  });

  const fails = res.issues.filter((i) => i.level === 'FAIL');
  const warns = res.issues.filter((i) => i.level === 'WARN');
  const isPass = failOn === 'warn' ? fails.length === 0 && warns.length === 0 : fails.length === 0;

  let displayIssues = res.issues;
  if (options.maxIssues && options.maxIssues > 0) {
    displayIssues = displayIssues.slice(0, Number(options.maxIssues));
  }

  if (options.json) {
    console.log(
      formatDeterministicJson({
        valid: isPass,
        style,
        part: options.part || null,
        failCount: fails.length,
        warnCount: warns.length,
        issueCount: res.issues.length,
        issues: displayIssues,
        lines: options.verbose ? res.lines : undefined,
      }),
    );
  } else {
    const status = isPass ? 'PASS' : 'FAIL';
    console.log(
      `${status}: ${inputPath} [${style}] — ${fails.length} failure(s), ${warns.length} warning(s)`,
    );

    if (displayIssues.length > 0) {
      console.log('\nIssues:');
      for (const iss of displayIssues) {
        const target = iss.channel || iss.joint || '';
        const tStr = iss.t != null ? `@${iss.t.toFixed(2)}s` : '';
        const loc = target || tStr ? ` (${[target, tStr].filter(Boolean).join(' ')})` : '';
        console.log(`  [${iss.level}] ${iss.rule}${loc}`);
        if (iss.hint) {
          console.log(`    Hint: ${iss.hint}`);
        }
      }
      if (options.maxIssues && res.issues.length > options.maxIssues) {
        console.log(`  ... and ${res.issues.length - options.maxIssues} more issues (truncated)`);
      }
    }

    if (options.verbose) {
      console.log('\nReport lines:');
      for (const [lvl, text] of res.lines) {
        console.log(`  [${lvl}] ${text}`);
      }
    }
  }

  return isPass ? 0 : 1;
}
