import type { RecordingMetrics, TimePoint } from '../types/analysis'
import { clamp, mean, standardDeviation } from '../analysis/statistics'

type AudioSample = { t: number; volume: number; pitch?: number }

function estimatePitch(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number | undefined {
  let rms = 0
  for (const value of buffer) rms += value * value
  rms = Math.sqrt(rms / buffer.length)
  if (rms < 0.025) return undefined
  let bestOffset = -1
  let bestCorrelation = 0
  const minOffset = Math.floor(sampleRate / 500)
  const maxOffset = Math.min(Math.floor(sampleRate / 70), buffer.length / 2)
  for (let offset = minOffset; offset < maxOffset; offset += 2) {
    let correlation = 0
    for (let index = 0; index < buffer.length - offset; index += 4) {
      correlation += buffer[index] * buffer[index + offset]
    }
    if (correlation > bestCorrelation) { bestCorrelation = correlation; bestOffset = offset }
  }
  return bestOffset > 0 ? sampleRate / bestOffset : undefined
}

export class AudioAnalyzer {
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private samples: AudioSample[] = []
  private running = false
  private startedAt = 0
  private timer = 0

  async start(stream: MediaStream): Promise<void> {
    this.context = new AudioContext()
    await this.context.resume()
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 1024
    this.context.createMediaStreamSource(stream).connect(this.analyser)
    this.samples = []
    this.running = true
    this.startedAt = performance.now()
    const buffer = new Float32Array(this.analyser.fftSize)
    const sample = () => {
      if (!this.running || !this.analyser || !this.context) return
      this.analyser.getFloatTimeDomainData(buffer)
      const volume = Math.sqrt(mean(Array.from(buffer, (value) => value * value)))
      this.samples.push({ t: performance.now() - this.startedAt, volume, pitch: estimatePitch(buffer, this.context.sampleRate) })
      this.timer = window.setTimeout(sample, 90)
    }
    sample()
  }

  async stop(recording: RecordingMetrics): Promise<RecordingMetrics> {
    this.running = false
    window.clearTimeout(this.timer)
    await this.context?.close()
    const volumes = this.samples.map((sample) => sample.volume)
    const noiseFloor = Math.max(mean(volumes.filter((_, index) => index < 8)), 0.008)
    const threshold = Math.max(noiseFloor * 1.8, 0.022)
    const speaking = this.samples.map((sample) => sample.volume > threshold)
    const speakingRatio = speaking.filter(Boolean).length / Math.max(speaking.length, 1)
    const firstSpeechIndex = speaking.findIndex(Boolean)
    let speechOnsets = 0
    speaking.forEach((active, index) => { if (active && !speaking[index - 1]) speechOnsets += 1 })
    const pitches = this.samples.map((sample) => sample.pitch).filter((pitch): pitch is number => pitch !== undefined && pitch < 500)
    const backgroundQuality = clamp(1 - noiseFloor / 0.08, 0, 1)
    const audioQuality = clamp(speakingRatio * 2.2, 0, 1) * 0.65 + backgroundQuality * 0.35
    const audioProblems: string[] = []
    if (audioQuality < 0.45) audioProblems.push('Das Mikrofonsignal war zu leise oder unklar.')
    if (backgroundQuality < 0.55) audioProblems.push('Es wurden deutliche Hintergrundgeräusche erkannt.')
    const mergedTimeline: TimePoint[] = recording.timeline.map((point) => {
      const nearest = this.samples.reduce((best, sample) => Math.abs(sample.t - point.t) < Math.abs(best.t - point.t) ? sample : best, this.samples[0] ?? { t: 0, volume: 0 })
      return { ...point, volume: nearest.volume, pitch: nearest.pitch }
    })
    return {
      ...recording,
      hasAudio: true,
      timeline: mergedTimeline,
      quality: recording.quality * 0.78 + audioQuality * 100 * 0.22,
      qualityBreakdown: { ...recording.qualityBreakdown, audio: Math.round(audioQuality * 100), backgroundNoise: Math.round(backgroundQuality * 100) },
      technicalProblems: [...recording.technicalProblems, ...audioProblems],
      features: {
        ...recording.features,
        volume: mean(volumes),
        volumeVariation: standardDeviation(volumes),
        speakingRatio,
        pauseRatio: 1 - speakingRatio,
        speechTempo: speechOnsets / Math.max(recording.durationMs / 60000, 0.01),
        pitchVariation: pitches.length > 4 ? standardDeviation(pitches) : undefined,
        responseDelay: firstSpeechIndex >= 0 ? this.samples[firstSpeechIndex].t / 1000 : recording.durationMs / 1000,
      },
    }
  }
}
