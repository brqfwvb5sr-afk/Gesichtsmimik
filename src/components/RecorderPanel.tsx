import { Camera, CircleAlert, LoaderCircle, Mic, MicOff, Play, ScanFace } from 'lucide-react'
import { useRecorder } from '../hooks/useRecorder'
import type { RecordingMetrics } from '../types/analysis'

export function RecorderPanel({ question, microphoneEnabled, onComplete }: {
  question: string
  microphoneEnabled: boolean
  onComplete: (recording: RecordingMetrics) => void
}) {
  const recorder = useRecorder(question, microphoneEnabled, onComplete)
  return (
    <div className="recorder">
      <div className="video-frame">
        <video ref={recorder.videoRef} muted playsInline aria-label="Kameravorschau" />
        {recorder.status === 'idle' && <div className="video-placeholder"><Camera /><span>Kamera noch nicht gestartet</span></div>}
        {recorder.status === 'loading' && <div className="video-overlay"><LoaderCircle className="spin" /><span>MediaPipe wird lokal vorbereitet …</span></div>}
        {recorder.status === 'countdown' && <div className="countdown" aria-live="assertive">{recorder.countdown}</div>}
        {recorder.status === 'recording' && <div className="recording-badge"><span /> Aufnahme · {recorder.remaining} s</div>}
        {recorder.status === 'processing' && <div className="video-overlay"><LoaderCircle className="spin" /><span>Messwerte werden lokal ausgewertet …</span></div>}
      </div>
      <div className="recorder-status">
        <span><ScanFace /> Gesichtsanalyse lokal</span>
        <span>{microphoneEnabled ? <Mic /> : <MicOff />} {microphoneEnabled ? 'Mikrofon optional aktiv' : 'Ohne Mikrofon'}</span>
      </div>
      {recorder.status === 'error' && <div className="error-message"><CircleAlert /> <span>{recorder.error}</span></div>}
      {recorder.status === 'idle' || recorder.status === 'error' ? (
        <button className="button primary wide" onClick={recorder.prepare}><Camera /> Berechtigungen prüfen</button>
      ) : recorder.status === 'ready' ? (
        <button className="button primary wide" onClick={recorder.begin}><Play /> Aufnahme starten</button>
      ) : null}
      <p className="privacy-line">Video- und Audiodaten verlassen dieses Gerät nicht und werden nicht als Aufnahme gespeichert.</p>
    </div>
  )
}
