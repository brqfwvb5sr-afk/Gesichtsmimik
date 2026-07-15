import { CalendarClock, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QualityMeter } from '../components/QualityMeter'
import { useApp } from '../context/AppContext'

export function HistoryPage() {
  const { history } = useApp()
  return (
    <div className="page">
      <header className="page-header"><span className="eyebrow">Lokaler Verlauf</span><h1>Vergleiche im Überblick</h1><p>Die letzten 50 Messungen werden nur in diesem Browser gespeichert.</p></header>
      {!history.length ? <div className="empty-state compact"><History /><h2>Noch keine Messungen</h2><p>Nach deiner ersten Analyse erscheint hier der lokale Verlauf.</p><Link to="/analyse" className="button primary">Analyse starten</Link></div> : <div className="history-list">{history.map(({ recording, result }) => <article key={recording.id}><div className="history-date"><CalendarClock /><span>{new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(recording.createdAt))}</span></div><div className="history-question"><strong>{recording.question}</strong><small>{recording.hasAudio ? 'Gesicht + Stimme' : 'Nur Gesicht'}</small></div><QualityMeter value={recording.quality} label="Qualität" /><div className="history-score"><strong>{result.total === null ? '–' : `${result.total} %`}</strong><span>{result.total === null ? 'zu geringe Qualität' : 'Abweichungswert'}</span></div></article>)}</div>}
    </div>
  )
}
