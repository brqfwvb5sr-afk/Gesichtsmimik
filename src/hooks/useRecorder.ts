import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioAnalyzer } from '../services/audioAnalyzer'
import { FaceAnalyzer } from '../services/faceAnalyzer'
import { FriendlyMediaError, requestMedia, stopMedia } from '../services/media'
import type { RecordingMetrics } from '../types/analysis'

export type RecorderStatus = 'idle' | 'loading' | 'ready' | 'countdown' | 'recording' | 'processing' | 'error'

export function useRecorder(question: string, microphoneEnabled: boolean, onComplete: (recording: RecordingMetrics) => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceRef = useRef<FaceAnalyzer | null>(null)
  const audioRef = useRef<AudioAnalyzer | null>(null)
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [remaining, setRemaining] = useState(12)

  const prepare = useCallback(async () => {
    setStatus('loading'); setError('')
    try {
      const stream = await requestMedia(microphoneEnabled)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      const face = new FaceAnalyzer()
      try { await face.initialize() } catch { throw new Error('MEDIAPIPE') }
      faceRef.current = face
      setStatus('ready')
    } catch (reason) {
      stopMedia(streamRef.current)
      streamRef.current = null
      if (reason instanceof FriendlyMediaError) setError(reason.message)
      else if (reason instanceof Error && reason.message === 'MEDIAPIPE') setError('MediaPipe konnte nicht geladen werden. Prüfe die Internetverbindung und lade die Seite neu.')
      else setError('Die Analyse konnte nicht vorbereitet werden.')
      setStatus('error')
    }
  }, [microphoneEnabled])

  const begin = useCallback(() => {
    if (!streamRef.current || !videoRef.current || !faceRef.current) return
    setStatus('countdown'); setCountdown(3)
    let value = 3
    const countdownTimer = window.setInterval(() => {
      value -= 1
      setCountdown(value)
      if (value <= 0) {
        window.clearInterval(countdownTimer)
        setStatus('recording'); setRemaining(12)
        const startedAt = performance.now()
        faceRef.current!.start(videoRef.current!, overlayRef.current)
        if (microphoneEnabled && streamRef.current!.getAudioTracks().length) {
          const audio = new AudioAnalyzer()
          audioRef.current = audio
          void audio.start(streamRef.current!)
        }
        const progressTimer = window.setInterval(() => {
          const elapsed = performance.now() - startedAt
          setRemaining(Math.max(0, Math.ceil((12000 - elapsed) / 1000)))
          if (elapsed >= 12000) {
            window.clearInterval(progressTimer)
            setStatus('processing')
            const faceRecording = faceRef.current!.stop(question, elapsed)
            const finish = audioRef.current ? audioRef.current.stop(faceRecording) : Promise.resolve(faceRecording)
            void finish.then((recording) => { onComplete(recording); setStatus('ready') })
          }
        }, 100)
      }
    }, 1000)
  }, [microphoneEnabled, onComplete, question])

  useEffect(() => () => {
    faceRef.current?.close()
    stopMedia(streamRef.current)
  }, [])

  return { videoRef, overlayRef, status, error, countdown, remaining, prepare, begin }
}
