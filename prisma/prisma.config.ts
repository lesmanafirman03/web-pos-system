import { defineConfig } from '@prisma/config';

export default defineConfig({
  seed: {
    run: 'node prisma/seed.js',
  },
});
