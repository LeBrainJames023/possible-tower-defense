import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const arcade = process.env.ARCADE_BUILD === '1';

/** Ship art only. `public/preview` stays in this repo. */
function copyArcadeArt(): void {
  const dest = path.resolve('dist-arcade');
  for (const dir of ['sprites', 'sfx', 'textures', 'icons']) {
    fs.cpSync(path.resolve('public', dir), path.join(dest, dir), { recursive: true });
  }
}

export default defineConfig({
  root: '.',
  publicDir: arcade ? false : 'public',
  base: arcade ? '/games/tower-defense/' : '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
  },
  plugins: arcade
    ? [
        {
          name: 'copy-arcade-art',
          closeBundle() {
            copyArcadeArt();
          },
        },
      ]
    : [],
  build: {
    outDir: arcade ? 'dist-arcade' : 'dist',
    sourcemap: !arcade,
    emptyOutDir: true,
  },
});
