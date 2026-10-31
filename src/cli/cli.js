import { runChannels } from './commands/channels.js';
import { runCheck } from './commands/check.js';
import { runCompare } from './commands/compare.js';
import { runCompose } from './commands/compose.js';
import { runEdit } from './commands/edit.js';
import { runExport } from './commands/export.js';
import { runImport } from './commands/import.js';
import { runMeasure } from './commands/measure.js';
import { runPose } from './commands/pose.js';
import { runPoses } from './commands/poses.js';
import { runRules } from './commands/rules.js';
import { runSchema } from './commands/schema.js';
import { runSheet } from './commands/sheet.js';
import { runValidate } from './commands/validate.js';
import { runVersion } from './commands/version.js';

export const CLI_VERSION = '1.6.0';

export function parseArgs(rawArgs) {
  const args = [];
  const options = {};

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--') {
      args.push(...rawArgs.slice(i + 1));
      break;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        options[camelCase(k)] = v;
      } else if (
        i + 1 < rawArgs.length &&
        !rawArgs[i + 1].startsWith('-') &&
        [
          'style',
          'part',
          'fail-on',
          'max-issues',
          'sheet',
          'dir',
          'out',
          'output',
          'frames',
          'view',
          'scale',
          'note',
          'parent',
          'channels',
          'delay',
          'damping',
          'overshoot',
          'freq',
          'template',
          'epsilon',
          't',
          'joint',
          'metrics',
          'contacts',
        ].includes(key)
      ) {
        options[camelCase(key)] = rawArgs[++i];
      } else {
        options[camelCase(key)] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1 && arg !== '-') {
      const flag = arg.slice(1);
      if (flag === 'h') options.help = true;
      else if (flag === 'v') options.version = true;
      else if (flag === 'j') options.json = true;
      else options[flag] = true;
    } else {
      args.push(arg);
    }
  }

  return { args, options };
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function printHelp(command = null) {
  if (command === 'check') {
    console.log(`clipkit check <clip-file> [options]

Runs schema validation, physics checks, and optional contact sheet rendering in one call.

Options:
  --sheet <dir>            Directory to output annotated contact sheet SVG and metadata
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --part <part>            Filter checks by body part: face | hands | arms | legs | torso
  --fail-on <level>        Fail threshold: 'fail' (default) or 'warn'
  --json                   Emit byte-identical JSON report
  --force                  Overwrite existing sheet files
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit check src/data/clips/slash.json --sheet ./out --json
`);
    return;
  }

  if (command === 'validate') {
    console.log(`clipkit validate <clip-file> [options]

Evaluates animation clip against anatomical, kinematic, and VRM 1.0 validation rules.

Options:
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --part <part>            Filter checks by body part: face | hands | arms | legs | torso
  --fail-on <level>        Fail threshold: 'fail' (default) or 'warn'
  --max-issues <n>         Limit output to first n issues
  --verbose                Print raw validation lines alongside structured issues
  --json                   Emit byte-identical JSON output

Example:
  clipkit validate src/data/clips/dodge.json --style realistic --json
`);
    return;
  }

  if (command === 'schema') {
    console.log(`clipkit schema <clip-file> [options]

Performs syntax and schema validation before physics checks, reporting location and "did you mean" hints.

Options:
  --json                   Emit machine-readable JSON output

Example:
  clipkit schema src/data/clips/walk.json
`);
    return;
  }

  if (command === 'channels') {
    console.log(`clipkit channels [options]

Lists all valid rig channels, anatomical limits, and body part assignments.

Options:
  --part <part>            Filter channels by part: face | hands | arms | legs | torso
  --json                   Emit channels as a JSON array

Example:
  clipkit channels --part arms
`);
    return;
  }

  if (command === 'rules') {
    console.log(`clipkit rules [options]

Lists all registered validation rules, descriptions, and configurable style limits.

Options:
  --json                   Emit rule registry and limits as JSON

Example:
  clipkit rules --json
`);
    return;
  }

  if (command === 'export') {
    console.log(`clipkit export <clip-file> [options]

Exports a ClipKit animation clip into standard binary .vrma (VRMC_vrm_animation-1.0).

Options:
  --out <file>             Output file path (default: <clip-name>.vrma, or '-' for stdout)
  --force                  Overwrite existing file
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit export src/data/clips/jump.json --out ./out/jump.vrma
`);
    return;
  }

  if (command === 'sheet') {
    console.log(`clipkit sheet <clip-file> [options]

Renders a headless contact sheet with distal motion arcs, gameplay windows, and JSON metadata.

Options:
  --frames <n>             Number of sampled frames (4 to 16, default: 8)
  --view <mode>            Camera view: perspective (default) | front | side | multi
  --silhouette             Render high-contrast silhouette contrast mode
  --png                    Export rasterized PNG image alongside SVG
  --gif                    Render animated looping GIF of character motion
  --dir <dir>              Output directory for SVG, PNG/GIF, and metadata sidecar
  --out <file>             Specific output file path (.svg, .png, or .gif)
  --json                   Output metadata JSON to stdout
  --force                  Overwrite existing files
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit sheet src/data/clips/slash.json --frames 10 --view multi --dir ./sheets
  clipkit sheet src/data/clips/jump.json --gif --out ./sheets/jump.gif
`);
    return;
  }

  if (command === 'poses') {
    console.log(`clipkit poses <subcommand> [options]

Inspects and lists named single-keyframe poses from the ClipKit Pose Library.

Subcommands:
  list                     List all available poses (can filter by --part)
  show <name>              Show detailed channel and expression values for a pose

Options:
  --part <part>            Filter poses by body part (face | hands | arms | torso | legs)
  --json                   Output pose data as JSON

Example:
  clipkit poses list --part hands
  clipkit poses show fist_L --json
`);
    return;
  }

  if (command === 'pose') {
    console.log(`clipkit pose <clip-file> [options]

Evaluates Forward Kinematics and extracts 3D world joint positions and transforms at timestamp t.

Options:
  --t <seconds>            Timestamp in seconds to sample (default: 0)
  --joint <name>           Inspect a specific joint (e.g. Head, LeftHand, LeftFoot)
  --json                   Output machine-readable JSON containing all 55 joint positions

Example:
  clipkit pose src/data/clips/slash.json --t 0.3 --json
  clipkit pose src/data/clips/slash.json --t 0.3 --joint RightHand
`);
    return;
  }

  if (command === 'measure') {
    console.log(`clipkit measure <clip-file> [options]

Measures key anatomical clearances, heel/toe floor heights, stance width/stagger, hand-to-head metrics, and Center of Mass stability.

Options:
  --t <seconds>            Timestamp in seconds to sample (default: 0)
  --json                   Output machine-readable JSON metrics

Example:
  clipkit measure src/data/clips/slash.json --t 0.3
  clipkit measure src/data/clips/walk.json --t 0.4 --json
`);
    return;
  }

  if (command === 'compose') {
    console.log(`clipkit compose <clip-file> [options]

Flattens layered animation clips into a regular standalone clip with merge semantics.

Options:
  --output <file>          Path to write the composed clip JSON
  --fail-on <level>        Fail on composition warnings ('warn')
  --json                   Output composed clip JSON to stdout
  --force                  Overwrite existing output file

Example:
  clipkit compose jump_with_punch.json --output ./composed_jump.json
`);
    return;
  }

  if (command === 'edit') {
    console.log(`clipkit edit <operation> <clip-file> [options]

Performs deterministic editing operations on animation clips.

Operations:
  mirror                   Reflect motion across sagittal plane (X to -X, swap L/R)
  retime                   Scale timing and duration by a factor (--scale <f>)
  scale-amplitude          Scale channel rotation/displacement amplitudes (--scale <f>)
  close-loop               Close animation loop by matching end to start
  overlap                  Apply hierarchical propagation delay and damped overshoot
  foot-ik                  Apply two-bone analytic IK to eliminate foot sliding
  micro-dynamics           Apply procedural idle micro-motion (breathing, sway, saccades)

Options:
  --scale <factor>         Scaling factor for retime or scale-amplitude
  --channels <list>        Comma-separated channels to scale (for scale-amplitude)
  --delay <seconds>        Base propagation delay step per hierarchy level (default: 0.03)
  --damping <factor>       Damping decay coefficient for overshoot (default: 12)
  --overshoot <factor>     Overshoot amplitude factor (default: 0.08)
  --blend-window <seconds> Transition blending window duration for Foot IK (default: 0.04)
  --seed <number>          PRNG seed for procedural micro-dynamics (default: 42)
  --no-breathing           Disable breathing oscillation in micro-dynamics
  --no-sway                Disable postural weight shifting in micro-dynamics
  --no-saccades            Disable anticipatory eye saccades in micro-dynamics
  --output <file>          Path to write the modified clip JSON
  --json                   Output modified clip JSON to stdout
  --force                  Overwrite existing output file

Example:
  clipkit edit mirror slash.json --output slash_mirrored.json
  clipkit edit foot-ik walk.json --output walk_ik.json
  clipkit edit micro-dynamics idle.json --output idle_alive.json
  clipkit edit overlap slash.json --delay 0.03 --damping 12 --output slash_overlap.json

`);
    return;
  }

  if (command === 'compare') {
    console.log(`clipkit compare <clipA> <clipB> [options]

Reports per-joint metric differences and renders side-by-side comparative contact sheets.

Options:
  --sheet <dir>            Render side-by-side comparison sheet SVG to directory
  --style <style>          Validation style: realistic | stylized (default) | exaggerated
  --json                   Output comparison metrics and diff as JSON
  --force                  Overwrite existing sheet file

Example:
  clipkit compare jump jump_floaty.json --sheet ./out --json
`);
    return;
  }

  if (command === 'import') {
    console.log(`clipkit import <file> [options]

Ingests and decompiles external .vrma, .glb, or .bvh animation into a sparse ClipKit JSON clip.

Options:
  --output <file>          Path to save decompiled ClipKit clip JSON
  --epsilon <tolerance>    RDP curve simplification tolerance (default: 0.8)
  --filter-jitter          Apply zero-phase smoothing filter to remove sensor noise
  --report                 Print compression reduction and fidelity telemetry
  --json                   Emit byte-identical JSON

Example:
  clipkit import mocap.bvh --output walk.json --report
  clipkit import dance.vrma --output dance.json --epsilon 0.5
`);
    return;
  }

  if (command === 'version') {
    console.log(`clipkit version <clip-file> [options]

Creates an immutable version in a clip variant folder with manifest.json tracking.

Options:
  --parent <version>       Parent version number (default: current - 1)
  --note <note>            Description of changes / intent for this version
  --dir <dir>              Custom directory for variants (default: ./variants/<clip>)
  --force                  Force overwrite if version file exists
  --json                   Output version metadata as JSON

Example:
  clipkit version jump.json --parent 1 --note "Floatier jump apex"
`);
    return;
  }

  console.log(`ClipKit Web Agent CLI v${CLI_VERSION}

Deterministic, machine-first command line interface for animation validation,
diagnostics, VRMA export, contact sheets, and modular composition.

Usage:
  clipkit <command> [arguments] [options]

Commands:
  check <clip>             Run schema, validation, and optional contact sheet together
  validate <clip>          Validate animation against kinematics, anatomy, and VRM 1.0
  schema <clip>            Validate clip schema and detect unknown channels with suggestions
  channels                 List available channels, ranges, and body parts
  rules                    List validation rules and style threshold limits
  export <clip>            Export clip to binary .vrma (VRMC_vrm_animation-1.0)
  import <file>            Ingest and decompile .vrma, .glb, or .bvh into ClipKit JSON
  sheet <clip>             Render headless annotated contact sheet (SVG + JSON sidecar)
  poses <subcommand>       Browse pose library (list | show <name>)
  pose <clip>              Sample world joint positions at timestamp t (e.g. --t 0.5)
  measure <clip>           Measure anatomical clearances, stance, and hand/head metrics
  compose <clip>           Flatten layer clip into a normal clip
  edit <op> <clip>         Deterministic edit operations (mirror | retime | scale-amplitude | close-loop | overlap | foot-ik | micro-dynamics)
  compare <a> <b>          Compare kinematics and render side-by-side contact sheet
  version <clip>           Create immutable variant version with manifest.json tracking

Global Options:
  -h, --help               Show help for command
  -v, --version            Show CLI version
  --json                   Machine-readable deterministic JSON output

Run 'clipkit <command> --help' for details and examples on any command.
`);
}

export async function main(argv = process.argv.slice(2)) {
  const { args, options } = parseArgs(argv);

  if (options.version) {
    console.log(`clipkit v${CLI_VERSION}`);
    return 0;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (options.help || !command) {
    printHelp(command);
    return 0;
  }

  try {
    switch (command) {
      case 'check':
        return await runCheck(commandArgs, options);
      case 'validate':
        return await runValidate(commandArgs, options);
      case 'schema':
        return await runSchema(commandArgs, options);
      case 'channels':
        return await runChannels(commandArgs, options);
      case 'rules':
        return await runRules(commandArgs, options);
      case 'export':
        return await runExport(commandArgs, options);
      case 'import':
        return await runImport(commandArgs, options);
      case 'sheet':
        return await runSheet(commandArgs, options);
      case 'poses':
        return await runPoses(commandArgs, options);
      case 'pose':
        return await runPose(commandArgs, options);
      case 'measure':
        return await runMeasure(commandArgs, options);
      case 'compose':
        return await runCompose(commandArgs, options);
      case 'edit':
        return await runEdit(commandArgs, options);
      case 'compare':
        return await runCompare(commandArgs, options);
      case 'version':
        return await runVersion(commandArgs, options);
      default:
        console.error(`Error: Unknown command '${command}'. Run 'clipkit --help' for usage.`);
        return 2;
    }
  } catch (err) {
    console.error(err.stack || `Error: ${err.message}`);
    return 3;
  }
}
