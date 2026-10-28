import { runChannels } from './commands/channels.js';
import { runCheck } from './commands/check.js';
import { runExport } from './commands/export.js';
import { runRules } from './commands/rules.js';
import { runSchema } from './commands/schema.js';
import { runSheet } from './commands/sheet.js';
import { runValidate } from './commands/validate.js';

export const CLI_VERSION = '1.0.0';

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
          'frames',
          'view',
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
  --dir <dir>              Output directory for SVG and metadata sidecar
  --out <file>             Specific SVG output file path
  --json                   Output metadata JSON to stdout
  --force                  Overwrite existing files
  --allow-outside          Allow writing outside current working directory

Example:
  clipkit sheet src/data/clips/slash.json --frames 10 --view multi --dir ./sheets
`);
    return;
  }

  console.log(`ClipKit Web Agent CLI v${CLI_VERSION}

Deterministic, machine-first command line interface for animation validation,
diagnostics, VRMA export, and contact sheet inspection.

Usage:
  clipkit <command> [arguments] [options]

Commands:
  check <clip>             Run schema, validation, and optional contact sheet together
  validate <clip>          Validate animation against kinematics, anatomy, and VRM 1.0
  schema <clip>            Validate clip schema and detect unknown channels with suggestions
  channels                 List available channels, ranges, and body parts
  rules                    List validation rules and style threshold limits
  export <clip>            Export clip to binary .vrma (VRMC_vrm_animation-1.0)
  sheet <clip>             Render headless annotated contact sheet (SVG + JSON sidecar)

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
      case 'sheet':
        return await runSheet(commandArgs, options);
      default:
        console.error(`Error: Unknown command '${command}'. Run 'clipkit --help' for usage.`);
        return 2;
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 3;
  }
}
