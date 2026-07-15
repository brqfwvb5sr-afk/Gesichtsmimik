import { FEATURE_LABELS } from './constants'
import { clamp } from './statistics'
import type { Baseline, ExperimentalInference, FeatureKey, RecordingMetrics } from '../types/analysis'

type Signal = { key: FeatureKey; support: number }

export function calculateExperimentalInference(recording: RecordingMetrics, baseline: Baseline): ExperimentalInference {
  const model = baseline.calibrationModel
  if (!model || model.truthful.sampleCount < 3 || model.invented.sampleCount < 2) {
    return { available: false, score: null, verdict: 'unclear', confidence: 'low', reliability: 0, evidence: [] }
  }

  let truthDistance = 0
  let inventedDistance = 0
  let totalWeight = 0
  const signals: Signal[] = []

  Object.entries(model.weights).forEach(([rawKey, weightValue]) => {
    const key = rawKey as FeatureKey
    const value = recording.features[key]
    const global = baseline.features[key]
    const truth = model.truthful.features[key]
    const invention = model.invented.features[key]
    const weight = weightValue ?? 0
    if (value === undefined || !Number.isFinite(value) || !global || !truth || !invention || weight <= 0) return
    const scale = Math.max(global.mad, 0.015)
    const distanceToTruth = clamp(Math.abs(value - truth.median) / scale, 0, 6)
    const distanceToInvention = clamp(Math.abs(value - invention.median) / scale, 0, 6)
    truthDistance += distanceToTruth * weight
    inventedDistance += distanceToInvention * weight
    totalWeight += weight
    signals.push({ key, support: (distanceToTruth - distanceToInvention) * weight })
  })

  const usedFeatures = signals.length
  if (usedFeatures < 4 || totalWeight <= 0) {
    return { available: false, score: null, verdict: 'unclear', confidence: 'low', reliability: 0, evidence: [] }
  }

  truthDistance /= totalWeight
  inventedDistance /= totalWeight
  const margin = (truthDistance - inventedDistance) / Math.max(truthDistance + inventedDistance, 0.5)
  const featureCoverage = clamp(usedFeatures / Math.max(model.usableFeatures, 6), 0, 1)
  const modelStrength = clamp(model.separation / 1.4, 0, 1)
  const qualityStrength = clamp((recording.quality - 45) / 50, 0, 1)
  const reliability = clamp(featureCoverage * modelStrength * qualityStrength, 0, 1)
  const rawScore = clamp(50 + margin * 55, 0, 100)
  const score = Math.round(50 + (rawScore - 50) * reliability)
  const verdict = reliability < 0.3 || (score > 42 && score < 58)
    ? 'unclear'
    : score >= 58 ? 'invented' : 'truthful'

  const evidence = [...signals]
    .sort((a, b) => Math.abs(b.support) - Math.abs(a.support))
    .slice(0, 4)
    .map((signal) => `${FEATURE_LABELS[signal.key]} ähnelt stärker den ${signal.support > 0 ? 'erfundenen' : 'wahrheitsgemässen'} Vergleichsaufnahmen.`)

  return {
    available: true,
    score,
    verdict,
    confidence: reliability >= 0.62 ? 'medium' : 'low',
    reliability: Math.round(reliability * 100),
    evidence,
  }
}
