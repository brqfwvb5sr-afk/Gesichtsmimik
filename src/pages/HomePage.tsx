import { ArrowRight, Camera, LockKeyhole, ScanFace, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Disclaimer } from '../components/Disclaimer'
import { useApp } from '../context/AppContext'

export function HomePage() {
  const { baseline } = useApp()
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles /> Persönlicher Verhaltensvergleich</span>
          <h1>Veränderungen sehen.<br /><em>Nicht Wahrheit erraten.</em></h1>
          <p>Diese Forschungsanwendung vergleicht Gesichts- und Stimmmerkmale einer neuen Aufnahme mit deiner persönlichen Baseline – vollständig in deinem Browser.</p>
          <div className="hero-actions">
            <Link className="button primary" to={baseline ? '/analyse' : '/kalibrierung'}>{baseline ? 'Neue Analyse starten' : 'Kalibrierung starten'} <ArrowRight /></Link>
            <Link className="button ghost" to="/erklaerung">Wie es funktioniert</Link>
          </div>
          <div className="trust-row"><span><LockKeyhole /> Lokal verarbeitet</span><span><Camera /> Gute Beleuchtung nötig</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="face-orbit"><div className="scan-line" /><ScanFace /></div>
          <div className="metric-float one"><strong>Baseline</strong><span>dein normaler Bereich</span></div>
          <div className="metric-float two"><strong>Nur Vergleich</strong><span>keine Wahrheitsanalyse</span></div>
        </div>
      </section>
      <Disclaimer />
      <section className="how-strip">
        <div><span>01</span><h3>Kalibrieren</h3><p>Sechs kurze Aussagen bilden deinen persönlichen Vergleichsbereich.</p></div>
        <div><span>02</span><h3>Aufnehmen</h3><p>MediaPipe und Web Audio messen ausgewählte Veränderungen lokal.</p></div>
        <div><span>03</span><h3>Vergleichen</h3><p>Du erhältst einen Abweichungswert und eine Qualitätsbewertung.</p></div>
      </section>
    </div>
  )
}
