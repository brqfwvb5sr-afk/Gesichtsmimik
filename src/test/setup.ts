import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: () => 'test-id' },
  configurable: true,
})
