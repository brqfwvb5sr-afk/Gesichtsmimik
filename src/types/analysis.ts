export type FeatureKey =
  | 'blinkRate'
  | 'eyeOpenness'
  | 'browMovement'
  | 'mouthCornerMovement'
  | 'lipPress'
  | 'jawMovement'
  | 'headTilt'
  | 'headRotation'
  | 'smallHeadMovements'
  | 'expressionVariability'
  | 'expressionStateDuration'
  | 'volume'
  | 'volumeVariation'
  | 'speakingRatio'
  | 'pauseRatio'
  | 'speechTempo'
  | 'pitchVariation'
  | 'responseDelay'

export type CalibrationCategory = 'neutral' | 'invented' | 'emotional'

export interface TimePoint {
  t: number
  eye?: number
  brow?: number
  mouth?: number
  jaw?: number
  head?: number
  expression?: number
  volume?: number
  pitch?: number
}

export interface QualityBreakdown {
  faceVisible: number
  lighting: number
  frameRate: number
  stability: number
  duration: number
  audio?: number
  backgroundNoise?: number
}

export interface RecordingMetrics {
  id: string
  createdAt: string
  durationMs: number
  question: string
  category?: CalibrationCategory
  features: Partial<Record<FeatureKey, number>>
  quality: number
  qualityBreakdown: QualityBreakdown
  technicalProblems: string[]
  timeline: TimePoint[]
  hasAudio: boolean
}

export interface FeatureBaseline {
  median: number
  mad: number
  low: number
  high: number
  samples: number
}

export interface Baseline {
  version: 1
  createdAt: string
  sampleCount: number
  features: Partial<Record<FeatureKey, FeatureBaseline>>
}

export interface FeatureDifference {
  key: FeatureKey
  label: string
  value: number
  baseline: number
  robustZ: number
  score: number
  direction: 'higher' | 'lower'
}

export interface DeviationResult {
  total: number | null
  face: number | null
  voice: number | null
  quality: number
  differences: FeatureDifference[]
  technicalProblems: string[]
  insufficientQuality: boolean
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  microphoneEnabled: boolean
  reduceMotion: boolean
}

export interface StoredState {
  version: 1
  calibration: RecordingMetrics[]
  baseline: Baseline | null
  history: Array<{ recording: RecordingMetrics; result: DeviationResult }>
  settings: AppSettings
}
