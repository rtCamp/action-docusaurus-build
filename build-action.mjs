import { appendFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const env = process.env;
// Keep each invocation's output distinct when a job builds more than one site.
const work = mkdtempSync(path.join(env.RUNNER_TEMP, 'docusaurus-'));
const settingsPath = path.join(work, 'settings.json');
const output = path.join(work, 'build');
const settings = {
  sourceDirectory: env.SOURCE_DIRECTORY,
  docsDirectory: env.DOCS_DIRECTORY,
  sourceRef: env.SOURCE_REF,
  sourceRepository: env.SOURCE_REPOSITORY,
  title: env.SITE_TITLE,
  siteConfig: env.SITE_CONFIG,
  url: env.SITE_URL,
  baseUrl: env.BASE_URL,
  ...(env.SIDEBAR ? { sidebar: JSON.parse(env.SIDEBAR) } : {}),
};
writeFileSync(settingsPath, JSON.stringify(settings));
try {
  const child = spawnSync(process.execPath, ['cli.mjs', 'build', '--source', env.GITHUB_WORKSPACE, '--settings', settingsPath, '--out-dir', output], { stdio: 'inherit' });
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
  if (process.exitCode === 0) appendFileSync(env.GITHUB_OUTPUT, `build-directory=${output}\n`);
} finally {
  rmSync(settingsPath, { force: true });
}
