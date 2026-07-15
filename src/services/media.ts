export type MediaErrorCode = 'INSECURE' | 'NO_CAMERA' | 'DENIED' | 'BUSY' | 'UNKNOWN'

export class FriendlyMediaError extends Error {
  constructor(public code: MediaErrorCode, message: string) { super(message) }
}

export async function requestMedia(withMicrophone: boolean): Promise<MediaStream> {
  if (!window.isSecureContext && location.hostname !== 'localhost') {
    throw new FriendlyMediaError('INSECURE', 'Kamera und Mikrofon funktionieren nur über HTTPS.')
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new FriendlyMediaError('NO_CAMERA', 'Dieser Browser stellt keine Kamera-Schnittstelle bereit.')
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: withMicrophone ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false,
    })
  } catch (error) {
    const name = error instanceof DOMException ? error.name : ''
    if (name === 'NotAllowedError' || name === 'SecurityError') throw new FriendlyMediaError('DENIED', 'Der Zugriff wurde verweigert. Erlaube die Kamera in den Browser-Einstellungen.')
    if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new FriendlyMediaError('NO_CAMERA', 'Es wurde keine geeignete Kamera gefunden.')
    if (name === 'NotReadableError' || name === 'AbortError') throw new FriendlyMediaError('BUSY', 'Die Kamera wird möglicherweise bereits von einer anderen App verwendet.')
    throw new FriendlyMediaError('UNKNOWN', 'Kamera oder Mikrofon konnten nicht gestartet werden.')
  }
}

export function stopMedia(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}
