import type { Baseline, DeviationResult, FeatureDifference, FeatureKey, RecordingMetrics } from '../types/analysis'
import { FACE_FEATURES, FEATURE_LABELS, QUALITY_THRESHOLD, VOICE_FEATURES } from './constants'
import { clamp, mean } from './statistics'

function differencesFor(keys: FeatureKey[], recording: RecordingMetrics, baseline: Baseline): FeatureDifference[] {
  return keys.flatMap((key) => {
    const value = recording.features[key]
    const reference = baseline.features[key]
    if (value === undefined || !Number.isFinite(value) || !reference) return []
    const robustZ = clamp(Math.abs(value - reference.median) / Math.max(reference.mad, 0.015), 0, 6)
    const score = clamp((robustZ / 4) * 100, 0, 100)
    return [{
      key,
      label: FEATURE_LABELS[key],
      value,
      baseline: reference.median,
      robustZ,
      score,
      direction: value >= reference.median ? 'higher' as const : 'lower' as const,
    }]
  })
}

function weightedScore(differences: FeatureDifference[], quality: number): number | null {
  if (!differences.length) return null
  const capped = differences.map((difference) => Math.min(difference.score, 100))
  const raw = mean(capped)
  const qualityWeight = clamp((quality - 40) / 60, 0.25, 1)
  return Math.round(clamp(raw * (0.75 + qualityWeight * 0.25), 0, 100))
}

export function calculateDeviation(recording: RecordingMetrics, baseline: Baseline): DeviationResult {
  const faceDifferences = differencesFor(FACE_FEATURES, recording, baseline)
  const voiceDifferences = recording.hasAudio ? differencesFor(VOICE_FEATURES, recording, baseline) : []
  const all = [...faceDifferences, ...voiceDifferences].sort((a, b) => b.score - a.score)
  const insufficientQuality = recording.quality < QUALITY_THRESHOLD || faceDifferences.length < 4
  const face = weightedScore(faceDifferences, recording.quality)
  const voice = weightedScore(voiceDifferences, recording.quality)
  const total = insufficientQuality
    ? null
    : voice === null
      ? face
      : face === null
        ? voice
        : Math.round(face * 0.7 + voice * 0.3)

  return {
    total,
    face: insufficientQuality ? null : face,
    voice: insufficientQuality ? null : voice,
    quality: Math.round(recording.quality),
    differences: all.slice(0, 6),
    technicalProblems: recording.technicalProblems,
    insufficientQuality,
  }
}
