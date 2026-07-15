import { describe, expect, it } from 'vitest'
import { calculateBaseline } from './baseline'
import { recording } from '../test/fixtures'

describe('calculateBaseline', () => {
  it('uses a robust median so a large outlier does not move the center', () => {
    const samples = [10, 11, 12, 13, 100].map((blinkRate) => recording({ features: { blinkRate, eyeOpenness: .8 } }))
    const baseline = calculateBaseline(samples)
    expect(baseline.features.blinkRate?.median).toBe(12)
    expect(baseline.features.blinkRate?.high).toBeLessThan(20)
  })

  it('ignores recordings with very poor quality', () => {
    const baseline = calculateBaseline([
      recording({ features: { blinkRate: 10 } }),
      recording({ features: { blinkRate: 12 } }),
      recording({ quality: 20, features: { blinkRate: 99 } }),
    ])
    expect(baseline.features.blinkRate?.median).toBe(11)
    expect(baseline.features.blinkRate?.samples).toBe(2)
  })

  it('does not create a feature from missing values', () => {
    const baseline = calculateBaseline([recording({ features: {} }), recording({ features: {} })])
    expect(baseline.features.blinkRate).toBeUndefined()
  })
})
