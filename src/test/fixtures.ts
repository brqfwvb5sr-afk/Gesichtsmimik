import type { RecordingMetrics } from '../types/analysis'

export const recording = (overrides: Partial<RecordingMetrics> = {}): RecordingMetrics => ({
  id: crypto.randomUUID(), createdAt: new Date('2026-07-15T10:00:00Z').toISOString(), durationMs: 10000,
  question: 'Testfrage', quality: 90, hasAudio: true, technicalProblems: [], timeline: [],
  qualityBreakdown: { faceVisible: 95, lighting: 90, frameRate: 90, stability: 88, duration: 100, audio: 85, backgroundNoise: 80 },
  features: {
    blinkRate: 12, eyeOpenness: .8, browMovement: .1, mouthCornerMovement: .12, lipPress: .08,
    jawMovement: .16, headTilt: 3, headRotation: 5, smallHeadMovements: 18,
    expressionVariability: .1, expressionStateDuration: .25, volume: .08, volumeVariation: .02,
    speakingRatio: .7, pauseRatio: .3, speechTempo: 16, pitchVariation: 20, responseDelay: 1.1,
  },
  ...overrides,
})
