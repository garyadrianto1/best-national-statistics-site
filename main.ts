// Statistik Indonesia — hand-in program (Node 22, standard library only).
//
// It gathers the finished site: the static files under app/ and the
// screenshots/ renders, copies them into the output directory, and writes
// dossier.json there using the vendored make.fun dossier library. The
// output directory comes from MAKEFUN_OUTPUT_DIR when that variable is set
// and not blank; otherwise it falls back to /output.
//
// The program is deterministic: it writes no timestamps, no random values
// and nothing that depends on the machine, so two runs over the same files
// produce byte-identical output. It stops loudly if an input folder or the
// vendored library is missing instead of handing in a partial entry.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));

const envOutput = (process.env.MAKEFUN_OUTPUT_DIR ?? '').trim();
const outputDir = envOutput === '' ? '/output' : envOutput;

const appDir = join(scriptDir, 'app');
const shotsDir = join(scriptDir, 'screenshots');
if (!existsSync(appDir)) {
  throw new Error('hand-in failed: app/ is missing beside main.ts');
}
if (!existsSync(shotsDir)) {
  throw new Error('hand-in failed: screenshots/ is missing beside main.ts');
}

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
