import { Check, RotateCcw } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { RecorderPanel } from '../components/RecorderPanel'
import { useApp } from '../context/AppContext'
import type { CalibrationCategory, RecordingMetrics } from '../types/analysis'

const steps: Array<{ question: string; instruction: string; category: CalibrationCategory }> = [
  { question: 'Wie heisst du?', instruction: 'Antworte ruhig und wahrheitsgemäss.', category: 'neutral' },
  { question: 'Welcher Wochentag ist heute?', instruction: 'Gib eine kurze, neutrale und wahre Antwort.', category: 'neutral' },
  { question: 'Beschreibe ein erfundenes Frühstück.', instruction: 'Erfinde absichtlich eine harmlose Aussage.', category: 'invented' },
  { question: 'Behaupte, du seist gestern auf dem Mond gewesen.', instruction: 'Erzähle die harmlose erfundene Geschichte weiter.', category: 'invented' },
  { question: 'Erzähle von etwas, das dich gefreut hat.', instruction: 'Antworte wahrheitsgemäss und etwas emotionaler.', category: 'emotional' },
  { question: 'Was siehst du gerade vor dir?', instruction: 'Schliesse mit einer weiteren neutralen Aussage ab.', category: 'neutral' },
]

export function CalibrationPage() {
  const { calibration, addCalibration, finishCalibration, resetCalibration, settings } = useApp()
  const navigate = useNavigate()
  const index = Math.min(calibration.length, steps.length - 1)
  const step = steps[index]
  const onComplete = useCallback((recording: RecordingMetrics) => addCalibration(recording, step.category), [addCalibration, step.category])
  const progress = useMemo(() => calibration.length / steps.length * 100, [calibration.length])
  const complete = calibration.length >= steps.length
  const finish = () => { if (finishCalibration()) navigate('/analyse') }
  return (
    <div className="page calibration-page">
      <header className="page-header split"><div><span className="eyebrow">Persönliche Kalibrierung</span><h1>{complete ? 'Baseline aufnehmen abgeschlossen' : `Aufnahme ${calibration.length + 1} von ${steps.length}`}</h1><p>Halte die Kamera ruhig auf Augenhöhe und sprich etwa 8 bis 15 Sekunden.</p></div><button className="button small ghost" onClick={resetCalibration}><RotateCcw /> Neu beginnen</button></header>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="step-dots">{steps.map((item, itemIndex) => <span key={item.question} className={itemIndex < calibration.length ? 'done' : itemIndex === calibration.length ? 'active' : ''}>{itemIndex < calibration.length ? <Check /> : itemIndex + 1}</span>)}</div>
      {complete ? (
        <div className="completion-panel"><Check /><h2>Sechs Vergleichsaufnahmen sind bereit</h2><p>Jetzt werden eine robuste Baseline und ein experimentelles persönliches Ähnlichkeitsmodell berechnet. Es vergleicht spätere Aufnahmen mit deinen bekannten wahrheitsgemässen und erfundenen Mustern, kann sich aber irren.</p><button className="button primary" onClick={finish}>Vergleichsmodell berechnen</button></div>
      ) : (
        <div className="calibration-grid">
          <div className="prompt-panel"><span>Deine Frage</span><h2>{step.question}</h2><p>{step.instruction}</p><div className="prompt-tip">Beginne erst nach dem Countdown zu sprechen. Bleibe während der Aufnahme im Bild.</div></div>
          <RecorderPanel key={calibration.length} question={step.question} microphoneEnabled={settings.microphoneEnabled} onComplete={onComplete} />
        </div>
      )}
      <Disclaimer compact />
    </div>
  )
}
