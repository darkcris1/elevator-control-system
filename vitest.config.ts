// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path'; // For path.resolve

export default defineConfig({
  // Use Vite's core plugins for JSX transformation etc.
  plugins: [react()],

  test: {
    // Enable global APIs like `describe`, `it`, `expect` (similar to Jest)
    globals: true,
    // Set the test environment to simulate a browser DOM
    environment: 'happy-dom', // Faster than 'jsdom' typically
    // Path to your test setup file (e.g., for @testing-library/jest-dom extensions)
    setupFiles: ['/home/darkcris1/Personal/elevator-control-system/test/setup-test.ts'],
    // Specify patterns for test files
    include: ['**/*.{test,spec}.{ts,tsx}'],
    // Exclude certain paths from being considered test files
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    // If your components import CSS files and you need them processed
    css: true,

    // IMPORTANT: How to handle aliases in Vitest
    // Option 1: Manually mirror your Vite aliases (recommended if few aliases)
    alias: {
      '@': path.resolve(__dirname, './src'), // Make sure this matches your vite.config.ts and tsconfig.json
    },

    // Option 2: (Alternative for automatic alias detection if you want)
    // Uncomment the following if you'd rather Vitest infer aliases from tsconfig.json
    // Requires `bun add -D vite-tsconfig-paths`
    // plugins: [
    //   react(),
    //   tsconfigPaths(), // Make sure to import this at the top: `import tsconfigPaths from 'vite-tsconfig-paths';`
    // ],
    // ... then remove the `alias` object above.
  },
});