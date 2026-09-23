import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      exclude: ['dist/**', 'node_modules/**', 'coverage/**', 'scripts/**', '**/*.d.ts', '**/*.test.ts', '**/*.test.tsx'],
    },
  },
});