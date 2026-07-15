import { calculateDeviation } from '../analysis/deviation'
import type { Baseline, DeviationResult, RecordingMetrics } from '../types/analysis'

export function analyzeRecording(recording: RecordingMetrics, baseline: Baseline): Promise<DeviationResult> {
  if (typeof Worker === 'undefined') return Promise.resolve(calculateDeviation(recording, baseline))
  return new Promise((resolve) => {
    const worker = new Worker(new URL('../workers/analysis.worker.ts', import.meta.url), { type: 'module' })
    const fallback = window.setTimeout(() => { worker.terminate(); resolve(calculateDeviation(recording, baseline)) }, 4000)
    worker.onmessage = (event: MessageEvent<DeviationResult>) => {
      window.clearTimeout(fallback)
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = () => {
      window.clearTimeout(fallback)
      worker.terminate()
      resolve(calculateDeviation(recording, baseline))
    }
    worker.postMessage({ recording, baseline })
  })
}
