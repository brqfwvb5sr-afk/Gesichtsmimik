import { describe, expect, it } from 'vitest'
import { calculateBaseline } from './baseline'
import { calculateDeviation } from './deviation'
import { recording } from '../test/fixtures'

const baseline = calculateBaseline([
  recording(),
  recording({ features: { ...recording().features, blinkRate: 13, responseDelay: 1.2 } }),
  recording({ features: { ...recording().features, blinkRate: 11, responseDelay: 1 } }),
])

describe('calculateDeviation', () => {
  it('returns a bounded deviation score', () => {
    const result = calculateDeviation(recording({ features: { ...recording().features, blinkRate: 40 } }), baseline)
    expect(result.total).not.toBeNull()
    expect(result.total!).toBeGreaterThan(0)
    expect(result.total!).toBeLessThanOrEqual(100)
    expect(result.differences[0].key).toBe('blinkRate')
  })

  it('works without microphone values', () => {
    const result = calculateDeviation(recording({ hasAudio: false, features: { blinkRate: 13, eyeOpenness: .8, browMovement: .1, mouthCornerMovement: .12, lipPress: .08 } }), baseline)
    expect(result.voice).toBeNull()
    expect(result.total).not.toBeNull()
  })

  it('does not output a precise score for poor quality', () => {
    const result = calculateDeviation(recording({ quality: 30 }), baseline)
    expect(result.insufficientQuality).toBe(true)
    expect(result.total).toBeNull()
    expect(result.face).toBeNull()
  })
})
