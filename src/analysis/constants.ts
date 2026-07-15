import type { FeatureKey } from '../types/analysis'

export const FACE_FEATURES: FeatureKey[] = [
  'blinkRate', 'eyeOpenness', 'browMovement', 'mouthCornerMovement', 'lipPress',
  'jawMovement', 'headTilt', 'headRotation', 'smallHeadMovements',
  'expressionVariability', 'expressionStateDuration',
]

export const VOICE_FEATURES: FeatureKey[] = [
  'volume', 'volumeVariation', 'speakingRatio', 'pauseRatio', 'speechTempo',
  'pitchVariation', 'responseDelay',
]

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  blinkRate: 'Blinzelrate', eyeOpenness: 'Augenöffnung', browMovement: 'Augenbrauenbewegung',
  mouthCornerMovement: 'Mundwinkelbewegung', lipPress: 'Lippenpressen', jawMovement: 'Kieferbewegung',
  headTilt: 'Kopfneigung', headRotation: 'Kopfrotation', smallHeadMovements: 'kleine Kopfbewegungen',
  expressionVariability: 'Veränderung der Gesichtsausdrücke', expressionStateDuration: 'Dauer auffälliger Gesichtszustände',
  volume: 'Lautstärke', volumeVariation: 'Lautstärkeschwankung', speakingRatio: 'Sprechdauer',
  pauseRatio: 'Pausenanteil', speechTempo: 'ungefähres Sprechtempo', pitchVariation: 'Tonhöhenschwankung',
  responseDelay: 'Antwortverzögerung',
}

export const QUALITY_THRESHOLD = 55
