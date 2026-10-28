/**
 * Gera src/environments/environment.ts a partir do arquivo .env da raiz do projeto.
 * A variável API_BASE é lida do .env (padrão: '/api').
 */
import process from 'node:process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = resolve(rootDir, '.env');
const outDir = resolve(rootDir, 'src', 'environments');
const outFile = resolve(outDir, 'environment.ts');

const DEFAULT_API_BASE = '/api';

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const apiBase = (process.env.API_BASE ?? '').trim() || DEFAULT_API_BASE;

const content = [
  '// Arquivo gerado automaticamente por scripts/generate-env.mjs.',
  '// Não edite manualmente; altere a variável no arquivo .env da raiz do projeto.',
  'export const environment = {',
  `  apiBase: ${JSON.stringify(apiBase)}`,
  '};',
  ''
].join('\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, content, 'utf8');

console.log(`[generate-env] API_BASE=${apiBase} -> ${outFile}`);
