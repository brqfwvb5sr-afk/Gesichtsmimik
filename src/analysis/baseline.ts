import type { Baseline, FeatureBaseline, FeatureKey, RecordingMetrics } from '../types/analysis'
import { mad, median } from './statistics'

const MIN_SPREAD = 0.015

export function calculateBaseline(recordings: RecordingMetrics[]): Baseline {
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

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    sampleCount: recordings.length,
    features,
  }
}
