import { main } from './cli.js';

const exitCode = await main(process.argv.slice(2));
if (typeof exitCode === 'number' && exitCode !== 0) {
  process.exit(exitCode);
}
