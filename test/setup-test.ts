// src/setupTests.ts
import '@testing-library/jest-dom'; // Extends expect with DOM matchers
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest'; // Import afterEach from vitest

// Ensure cleanup after each test to prevent memory leaks and isolated tests
afterEach(() => {
  cleanup();
});