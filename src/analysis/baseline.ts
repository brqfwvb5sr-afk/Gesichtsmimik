import type { Baseline, CalibrationClassProfile, FeatureBaseline, FeatureKey, RecordingMetrics } from '../types/analysis'
import { clamp, mad, mean, median } from './statistics'

const MIN_SPREAD = 0.015

function featureBaselines(recordings: RecordingMetrics[]): Baseline['features'] {
  const keys = new Set<FeatureKey>()
  recordings.filter((r) => r.quality >= 45).forEach((recording) => {
    Object.keys(recording.features).forEach((key) => keys.add(key as FeatureKey))
  })

  const features: Baseline['features'] = {}
  keys.forEach((key) => {
    const values = recordings
      .filter((recording) => recording.quality >= 45)
      .map((recording) => recording.features[key])
      .filter((value): value is number => Number.isFinite(value))
    if (values.length < 2) return
    const center = median(values)
    const spread = Math.max(mad(values, center) * 1.4826, Math.abs(center) * 0.05, MIN_SPREAD)
    const feature: FeatureBaseline = {
      median: center,
      mad: spread,
      low: center - 2 * spread,
      high: center + 2 * spread,
      samples: values.length,
    }
    features[key] = feature
  })

  return features
}

function classProfile(recordings: RecordingMetrics[]): CalibrationClassProfile {
  return { sampleCount: recordings.length, features: featureBaselines(recordings) }
}

export function calculateBaseline(recordings: RecordingMetrics[]): Baseline {
  const features = featureBaselines(recordings)
  const truthfulRecordings = recordings.filter((recording) => recording.category !== 'invented')
  const inventedRecordings = recordings.filter((recording) => recording.category === 'invented')
  const truthful = classProfile(truthfulRecordings)
  const invented = classProfile(inventedRecordings)
  const weights: Partial<Record<FeatureKey, number>> = {}
  const separations: number[] = []

  Object.keys(features).forEach((rawKey) => {
    const key = rawKey as FeatureKey
    const global = features[key]
    const truth = truthful.features[key]
    const invention = invented.features[key]
    if (!global || !truth || !invention) return
    const separation = Math.abs(truth.median - invention.median) / Math.max(global.mad, MIN_SPREAD)
    const sampleReliability = Math.min(truth.samples, invention.samples) / 3
    const weight = clamp(0.15 + separation * sampleReliability, 0.15, 2.5)
    weights[key] = weight
    separations.push(Math.min(separation, 4))
  })

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    sampleCount: recordings.length,
    features,
    calibrationModel: {
      truthful,
      invented,
      weights,
      usableFeatures: Object.keys(weights).length,
      separation: mean(separations),
    },
  }
}
