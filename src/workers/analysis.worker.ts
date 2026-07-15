import { calculateDeviation } from '../analysis/deviation'
import type { Baseline, RecordingMetrics } from '../types/analysis'

self.onmessage = (event: MessageEvent<{ recording: RecordingMetrics; baseline: Baseline }>) => {
  self.postMessage(calculateDeviation(event.data.recording, event.data.baseline))
}
