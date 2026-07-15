import { ArrowRight, FlaskConical } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { RecorderPanel } from '../components/RecorderPanel'
import { useApp } from '../context/AppContext'
import type { RecordingMetrics } from '../types/analysis'

const questions = ['Erzähle, wie dein heutiger Tag war.', 'Beschreibe deinen letzten Urlaub.', 'Was möchtest du morgen machen?', 'Eigene Frage']

export function AnalysisPage() {
  const { baseline, addAnalysis, settings } = useApp()
  const [selected, setSelected] = useState(questions[0])
  const [custom, setCustom] = useState('')
  const navigate = useNavigate()
  const question = selected === 'Eigene Frage' ? custom.trim() : selected
  const complete = useCallback((recording: RecordingMetrics) => { void addAnalysis(recording).then(() => navigate('/ergebnisse')) }, [addAnalysis, navigate])
  if (!baseline) return (
    <div className="page empty-state"><FlaskConical /><h1>Zuerst kalibrieren</h1><p>Für einen persönlichen Vergleich werden sechs kurze Vergleichsaufnahmen benötigt.</p><Link to="/kalibrierung" className="button primary">Kalibrierung starten <ArrowRight /></Link></div>
  )
  return (
    <div className="page">
      <header className="page-header"><span className="eyebrow">Neue Analyse</span><h1>Mit deiner Baseline vergleichen</h1><p>Wähle eine Frage oder formuliere selbst eine. Das Ergebnis beschreibt nur messbare Veränderungen.</p></header>
      <div className="analysis-grid">
        <div className="question-picker"><label htmlFor="question">Frage auswählen</label><select id="question" value={selected} onChange={(event) => setSelected(event.target.value)}>{questions.map((item) => <option key={item}>{item}</option>)}</select>{selected === 'Eigene Frage' && <input autoFocus value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Deine Frage eingeben …" maxLength={160} />}<div className="baseline-summary"><span>Persönliche Baseline</span><strong>{baseline.sampleCount} Aufnahmen</strong><small>{Object.keys(baseline.features).length} vergleichbare Merkmale</small></div></div>
        {question ? <RecorderPanel question={question} microphoneEnabled={settings.microphoneEnabled} onComplete={complete} /> : <div className="prompt-needed">Bitte gib zuerst eine Frage ein.</div>}
      </div>
      <Disclaimer compact />
    </div>
  )
}
