import { FORMAT_VERSION } from '../vrm10/constants.js';
import { createIssue, RULE_CODES } from './rule-codes.js';

export function versionIssues(version, changelog, fv = 1) {
  const out = [];
  const issues = [];

  if (fv > FORMAT_VERSION) {
    out.push(['FAIL', `format_version ${fv} lebih baru dari yang didukung (${FORMAT_VERSION})`]);
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.VERSION_FORMAT,
        value: fv,
        limit: FORMAT_VERSION,
        hint: `format_version ${fv} is newer than currently supported version ${FORMAT_VERSION}.`,
      }),
    );
  }
  if (!Array.isArray(changelog) || !changelog.length) {
    out.push(['WARN', `v${version} tanpa changelog`]);
    issues.push(
      createIssue({
        level: 'WARN',
        rule: RULE_CODES.CHANGELOG_INVALID,
        hint: `Provide a changelog array detailing changes for v${version}.`,
      }),
    );
    return { lines: out, issues };
  }
  let ok = true;
  changelog.forEach((e, i) => {
    if (!e || +e.v !== i + 1 || !String(e.catatan || '').trim()) ok = false;
  });
  if (!ok) {
    out.push(['FAIL', 'changelog tidak valid (harus berurutan v1..vN, tiap entri punya catatan)']);
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.CHANGELOG_INVALID,
        hint: 'Changelog must be sequential from v1..vN with a non-empty catatan note.',
      }),
    );
  } else if (changelog[changelog.length - 1].v !== version) {
    const lastV = changelog[changelog.length - 1].v;
    out.push(['FAIL', `version ${version} tetapi changelog berakhir di v${lastV}`]);
    issues.push(
      createIssue({
        level: 'FAIL',
        rule: RULE_CODES.CHANGELOG_VERSION_MISMATCH,
        value: version,
        limit: lastV,
        hint: `Clip version ${version} does not match last changelog entry v${lastV}.`,
      }),
    );
  } else {
    out.push([
      'PASS',
      `versi v${version}, format ${fv}, changelog ${changelog.length} entri konsisten`,
    ]);
  }
  return { lines: out, issues };
}

export function check({ clip }) {
  const result = versionIssues(clip.version ?? 1, clip.changelog, clip.format_version ?? 1);
  return result;
}

export const versionRule = {
  name: 'version',
  check,
};
