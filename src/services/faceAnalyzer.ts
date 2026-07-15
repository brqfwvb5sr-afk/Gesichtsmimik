import { DrawingUtils, FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import type { QualityBreakdown, RecordingMetrics, TimePoint } from '../types/analysis'
import { clamp, mean, median, standardDeviation } from '../analysis/statistics'

const WASM_URL = `${import.meta.env.BASE_URL}mediapipe`
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

type FaceSample = {
  t: number; eye: number; brow: number; mouth: number; lip: number; jaw: number
  yaw: number; pitch: number; roll: number; expression: number; brightness: number
}

const category = (result: FaceLandmarkerResult, name: string): number => {
  const item = result.faceBlendshapes?.[0]?.categories.find((entry) => entry.categoryName === name)
  return item?.score ?? 0
}

const rotationFromMatrix = (result: FaceLandmarkerResult) => {
  const matrix = result.facialTransformationMatrixes?.[0]?.data
  if (!matrix || matrix.length < 16) return { yaw: 0, pitch: 0, roll: 0 }
  const toDeg = 180 / Math.PI
  return {
    yaw: Math.atan2(matrix[8], matrix[10]) * toDeg,
    pitch: Math.atan2(-matrix[9], Math.sqrt(matrix[8] ** 2 + matrix[10] ** 2)) * toDeg,
    roll: Math.atan2(matrix[1], matrix[5]) * toDeg,
  }
}

function brightness(video: HTMLVideoElement, canvas: HTMLCanvasElement): number {
  if (!video.videoWidth || !video.videoHeight) return 0.5
  canvas.width = 32
  canvas.height = 24
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return 0.5
  context.drawImage(video, 0, 0, 32, 24)
  const data = context.getImageData(0, 0, 32, 24).data
  let total = 0
  for (let index = 0; index < data.length; index += 16) {
    total += (data[index] + data[index + 1] + data[index + 2]) / (3 * 255)
  }
  return total / (data.length / 16)
}

export class FaceAnalyzer {
  private landmarker: FaceLandmarker | null = null
  private samples: FaceSample[] = []
  private frames = 0
  private startedAt = 0
  private lastAnalyzedAt = 0
  private running = false
  private canvas = document.createElement('canvas')
  private averageInferenceMs = 28
  private drawingUtils: DrawingUtils | null = null
  private overlayContext: CanvasRenderingContext2D | null = null

  async initialize(): Promise<void> {
    if (this.landmarker) return
    const vision = await FilesetResolver.forVisionTasks(WASM_URL)
    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      minFaceDetectionConfidence: 0.55,
      minFacePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
    })
  }

  start(video: HTMLVideoElement, overlay?: HTMLCanvasElement | null): void {
    if (!this.landmarker) throw new Error('MEDIAPIPE_NOT_READY')
    this.samples = []
    this.frames = 0
    this.startedAt = performance.now()
    this.lastAnalyzedAt = 0
    this.running = true
    if (overlay) {
      this.overlayContext = overlay.getContext('2d')
      this.drawingUtils = this.overlayContext ? new DrawingUtils(this.overlayContext) : null
    }

    const tick = () => {
      if (!this.running) return
      const now = performance.now()
      const adaptiveInterval = Math.max(38, this.averageInferenceMs * 1.18)
      if (video.readyState >= 2 && now - this.lastAnalyzedAt >= adaptiveInterval) {
        this.lastAnalyzedAt = now
        const inferenceStarted = performance.now()
        const result = this.landmarker!.detectForVideo(video, now)
        const inferenceMs = performance.now() - inferenceStarted
        this.averageInferenceMs = this.averageInferenceMs * 0.85 + inferenceMs * 0.15
        this.frames += 1
        this.drawOverlay(video, overlay, result)
        if (result.faceLandmarks?.length) {
          const rotation = rotationFromMatrix(result)
          const eye = 1 - mean([category(result, 'eyeBlinkLeft'), category(result, 'eyeBlinkRight')])
          const brow = mean([
            category(result, 'browInnerUp'), category(result, 'browOuterUpLeft'),
            category(result, 'browOuterUpRight'), category(result, 'browDownLeft'), category(result, 'browDownRight'),
          ])
          const mouth = mean([
            category(result, 'mouthSmileLeft'), category(result, 'mouthSmileRight'),
            category(result, 'mouthFrownLeft'), category(result, 'mouthFrownRight'),
          ])
          const lip = mean([category(result, 'mouthPressLeft'), category(result, 'mouthPressRight')])
          const jaw = category(result, 'jawOpen')
          const expression = mean([brow, mouth, lip, jaw, Math.abs(eye - 0.85)])
          this.samples.push({
            t: now - this.startedAt, eye, brow, mouth, lip, jaw, expression,
            ...rotation, brightness: brightness(video, this.canvas),
          })
        }
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  private drawOverlay(video: HTMLVideoElement, overlay: HTMLCanvasElement | null | undefined, result: FaceLandmarkerResult): void {
    if (!overlay || !this.overlayContext || !this.drawingUtils) return
    if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
      overlay.width = video.videoWidth
      overlay.height = video.videoHeight
    }
    this.overlayContext.clearRect(0, 0, overlay.width, overlay.height)
    const landmarks = result.faceLandmarks?.[0]
    if (!landmarks) return
    this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: 'rgba(85, 216, 191, 0.22)', lineWidth: 0.6 })
    this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: 'rgba(144, 134, 255, 0.95)', lineWidth: 2 })
    this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#55d8bf', lineWidth: 1.8 })
    this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#55d8bf', lineWidth: 1.8 })
    this.drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: 'rgba(144, 134, 255, 0.9)', lineWidth: 1.6 })
  }

  stop(question: string, durationMs: number): RecordingMetrics {
    this.running = false
    if (this.overlayContext) this.overlayContext.clearRect(0, 0, this.overlayContext.canvas.width, this.overlayContext.canvas.height)
    const samples = this.samples
    const durationMinutes = Math.max(durationMs / 60000, 0.01)
    let blinks = 0
    let blinkActive = false
    for (const sample of samples) {
      if (sample.eye < 0.48 && !blinkActive) { blinks += 1; blinkActive = true }
      if (sample.eye > 0.72) blinkActive = false
    }
    const headDelta = samples.slice(1).map((sample, index) =>
      Math.abs(sample.yaw - samples[index].yaw) + Math.abs(sample.pitch - samples[index].pitch) + Math.abs(sample.roll - samples[index].roll))
    const expressionValues = samples.map((sample) => sample.expression)
    const faceRatio = clamp(samples.length / Math.max(durationMs / 70, 1), 0, 1)
    const averageBrightness = mean(samples.map((sample) => sample.brightness))
    const lighting = clamp(1 - Math.abs(averageBrightness - 0.52) / 0.5, 0, 1)
    const measuredFps = this.frames / Math.max(durationMs / 1000, 0.1)
    const frameRate = clamp(measuredFps / 20, 0, 1)
    const stability = samples.length
      ? mean(samples.map((sample) => Math.abs(sample.yaw) < 28 && Math.abs(sample.pitch) < 24 ? 1 : 0))
      : 0
    const durationQuality = clamp(durationMs / 8000, 0, 1)
    const qualityBreakdown: QualityBreakdown = {
      faceVisible: Math.round(faceRatio * 100),
      lighting: Math.round(lighting * 100),
      frameRate: Math.round(frameRate * 100),
      stability: Math.round(stability * 100),
      duration: Math.round(durationQuality * 100),
    }
    const quality = mean(Object.values(qualityBreakdown))
    const technicalProblems: string[] = []
    if (faceRatio < 0.65) technicalProblems.push('Das Gesicht war zeitweise nicht vollständig sichtbar.')
    if (lighting < 0.55) technicalProblems.push('Die Beleuchtung war zu dunkel, zu hell oder ungleichmässig.')
    if (frameRate < 0.65) technicalProblems.push('Die Bildrate war zu niedrig oder instabil.')
    if (stability < 0.65) technicalProblems.push('Der Kopf war häufig stark gedreht oder geneigt.')
    if (durationMs < 7000) technicalProblems.push('Die Aufnahme war zu kurz.')

    const timeline: TimePoint[] = samples.filter((_, index) => index % 3 === 0).map((sample) => ({
      t: sample.t, eye: sample.eye, brow: sample.brow, mouth: sample.mouth,
      jaw: sample.jaw, head: Math.abs(sample.yaw) + Math.abs(sample.pitch), expression: sample.expression,
    }))

    return {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(), durationMs, question,
      quality, qualityBreakdown, technicalProblems, timeline, hasAudio: false,
      features: {
        blinkRate: blinks / durationMinutes,
        eyeOpenness: median(samples.map((sample) => sample.eye)),
        browMovement: standardDeviation(samples.map((sample) => sample.brow)),
        mouthCornerMovement: standardDeviation(samples.map((sample) => sample.mouth)),
        lipPress: mean(samples.map((sample) => sample.lip)),
        jawMovement: standardDeviation(samples.map((sample) => sample.jaw)),
        headTilt: median(samples.map((sample) => Math.abs(sample.roll))),
        headRotation: median(samples.map((sample) => Math.abs(sample.yaw))),
        smallHeadMovements: headDelta.filter((value) => value > 0.7).length / durationMinutes,
        expressionVariability: standardDeviation(expressionValues),
        expressionStateDuration: expressionValues.filter((value) => value > 0.22).length / Math.max(expressionValues.length, 1),
      },
    }
  }

  close(): void {
    this.running = false
    this.landmarker?.close()
    this.landmarker = null
  }
}
