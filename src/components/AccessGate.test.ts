import { describe, expect, it } from 'vitest'
import { verifyAccessCode } from './AccessGate'

describe('verifyAccessCode', () => {
  it('accepts the configured access code', () => {
    expect(verifyAccessCode('Penis')).toBe(true)
  })

  it('accepts harmless whitespace and different casing', () => {
    expect(verifyAccessCode('  penis  ')).toBe(true)
  })

  it('rejects an incorrect or empty code', () => {
    expect(verifyAccessCode('falsch')).toBe(false)
    expect(verifyAccessCode('')).toBe(false)
  })
})
