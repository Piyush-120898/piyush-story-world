import { mkdir, copyFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { renderPage } from '../app/page.mjs';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await mkdir(output, { recursive: true });
await writeFile(resolve(root, 'public/index.html'), renderPage());
async function copyAssets(source, destination) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = resolve(source, entry.name);
    const to = resolve(destination, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyAssets(from, to);
    } else {
      await copyFile(from, to);
    }
  }
}
await copyAssets(resolve(root, 'public'), output);
await writeFile(resolve(output, '.nojekyll'), '');
console.log('Built static portfolio in ' + output);
