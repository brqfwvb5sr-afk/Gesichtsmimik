import { AlertTriangle, ArrowRight, CheckCircle2, Gauge, ScanFace, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { LineChart } from '../components/LineChart'
import { QualityMeter } from '../components/QualityMeter'
import { useApp } from '../context/AppContext'

export function ResultsPage() {
  const { history } = useApp()
  const latest = history[0]
  if (!latest) return <div className="page empty-state"><Gauge /><h1>Noch kein Ergebnis</h1><p>Nimm zuerst eine Aussage auf und vergleiche sie mit deiner Baseline.</p><Link className="button primary" to="/analyse">Analyse starten <ArrowRight /></Link></div>
  const { recording, result } = latest
  return (
    <div className="page results-page">
      <header className="page-header split"><div><span className="eyebrow">Letzte Messung</span><h1>Dein Vergleichsergebnis</h1><p>Frage: „{recording.question}“</p></div><Link className="button ghost small" to="/analyse">Neue Aufnahme</Link></header>
      {result.insufficientQuality ? (
        <div className="low-quality"><AlertTriangle /><div><h2>Die Aufnahmequalität war zu niedrig</h2><p>Bitte wiederhole die Aufnahme bei besserem Licht, mit ruhiger Kameraposition und vollständig sichtbarem Gesicht. Deshalb wird kein scheinbar präziser Abweichungswert ausgegeben.</p></div></div>
      ) : (
        <div className="score-grid">
          <div className="score-main"><span>Abweichungswert</span><strong>{result.total}<small>%</small></strong><p>gegenüber deiner persönlichen Baseline</p></div>
          <div className="subscores"><div><ScanFace /><span>Gesicht</span><strong>{result.face ?? '–'}{result.face !== null && ' %'}</strong></div><div><Volume2 /><span>Stimme</span><strong>{result.voice ?? 'nicht erfasst'}{result.voice !== null && ' %'}</strong></div></div>
        </div>
      )}
      <QualityMeter value={result.quality} />
      <div className="results-grid">
        <section className="result-section"><h2>Auffälligste gemessene Unterschiede</h2>{result.differences.length ? <ul className="difference-list">{result.differences.map((difference) => <li key={difference.key}><span className="difference-icon"><CheckCircle2 /></span><span><strong>{difference.direction === 'higher' ? 'Höhere' : 'Niedrigere'} {difference.label.toLowerCase()}</strong><small>stärker vom persönlichen Schwankungsbereich entfernt</small></span><b>{Math.round(difference.score)} %</b></li>)}</ul> : <p className="muted">Es waren nicht genügend vergleichbare Merkmale vorhanden.</p>}</section>
        <section className="result-section"><h2>Technische Hinweise</h2>{recording.technicalProblems.length ? <ul className="problem-list">{recording.technicalProblems.map((problem) => <li key={problem}><AlertTriangle />{problem}</li>)}</ul> : <div className="all-good"><CheckCircle2 /> Keine grösseren technischen Probleme erkannt.</div>}<div className="quality-breakdown">{Object.entries(recording.qualityBreakdown).map(([key, value]) => <div key={key}><span>{({ faceVisible: 'Gesicht sichtbar', lighting: 'Beleuchtung', frameRate: 'Bildrate', stability: 'Position', duration: 'Dauer', audio: 'Mikrofon', backgroundNoise: 'Hintergrundruhe' } as Record<string, string>)[key]}</span><b>{value} %</b></div>)}</div></section>
      </div>
      <section className="result-section full"><h2>Zeitlicher Verlauf</h2><LineChart data={recording.timeline} series={recording.hasAudio ? ['expression', 'head', 'volume'] : ['expression', 'head']} /></section>
      <div className="result-warning"><strong>Das Ergebnis zeigt nur eine Veränderung gegenüber deinen Vergleichsaufnahmen.</strong><span>Es sagt nicht, ob die Aussage wahr oder falsch ist.</span></div>
      <Disclaimer compact />
    </div>
  )
}
