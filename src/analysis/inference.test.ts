import { describe, expect, it } from 'vitest'
import { calculateBaseline } from './baseline'
import { calculateExperimentalInference } from './inference'
import { recording } from '../test/fixtures'
import type { RecordingMetrics } from '../types/analysis'

const truthFeatures = (offset = 0) => ({
  blinkRate: 10 + offset, eyeOpenness: .84 - offset * .005, browMovement: .05 + offset * .002,
  mouthCornerMovement: .06 + offset * .002, lipPress: .04 + offset * .002, jawMovement: .11 + offset * .002,
  headTilt: 2 + offset * .1, headRotation: 3 + offset * .1, smallHeadMovements: 10 + offset,
  expressionVariability: .06 + offset * .002, expressionStateDuration: .16 + offset * .005,
  volume: .07 + offset * .001, volumeVariation: .012 + offset * .001, speakingRatio: .72,
  pauseRatio: .28, speechTempo: 13 + offset, pitchVariation: 14 + offset, responseDelay: .8 + offset * .03,
})

const inventedFeatures = (offset = 0) => ({
  blinkRate: 29 + offset, eyeOpenness: .65 - offset * .005, browMovement: .18 + offset * .004,
  mouthCornerMovement: .2 + offset * .004, lipPress: .17 + offset * .003, jawMovement: .25 + offset * .003,
  headTilt: 6 + offset * .2, headRotation: 9 + offset * .2, smallHeadMovements: 28 + offset,
  expressionVariability: .2 + offset * .003, expressionStateDuration: .42 + offset * .005,
  volume: .11 + offset * .002, volumeVariation: .038 + offset * .002, speakingRatio: .55,
  pauseRatio: .45, speechTempo: 20 + offset, pitchVariation: 32 + offset, responseDelay: 1.7 + offset * .05,
})

const calibration: RecordingMetrics[] = [0, 1, 2, 3].map((offset) => recording({ category: offset === 2 ? 'emotional' : 'neutral', features: truthFeatures(offset) }))
calibration.push(recording({ category: 'invented', features: inventedFeatures(0) }), recording({ category: 'invented', features: inventedFeatures(2) }))
const baseline = calculateBaseline(calibration)

describe('experimental calibration inference', () => {
  it('recognises a recording closer to invented calibration samples', () => {
    const result = calculateExperimentalInference(recording({ quality: 95, features: inventedFeatures(1) }), baseline)
    expect(result.available).toBe(true)
    expect(result.verdict).toBe('invented')
    expect(result.score!).toBeGreaterThan(57)
  })

  it('recognises a recording closer to truthful calibration samples', () => {
    const result = calculateExperimentalInference(recording({ quality: 95, features: truthFeatures(1) }), baseline)
    expect(result.verdict).toBe('truthful')
    expect(result.score!).toBeLessThan(43)
  })

  it('stays unclear when recording quality is poor', () => {
    const result = calculateExperimentalInference(recording({ quality: 35, features: inventedFeatures(1) }), baseline)
    expect(result.verdict).toBe('unclear')
    expect(result.reliability).toBe(0)
  })
})
