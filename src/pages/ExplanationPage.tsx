import { Activity, AudioLines, Gauge, ScanFace } from 'lucide-react'
import { Disclaimer } from '../components/Disclaimer'

export function ExplanationPage() {
  return (
    <div className="page narrow">
      <header className="page-header"><span className="eyebrow">So funktioniert es</span><h1>Ein Vergleich, keine Diagnose</h1><p>Die App sucht keine universellen „Lügenzeichen“. Sie betrachtet nur, wie sich eine neue Aufnahme von deinen eigenen Vergleichsaufnahmen unterscheidet.</p></header>
      <div className="explanation-flow">
        <article><span><ScanFace /></span><div><h2>Gesichtsmerkmale</h2><p>Erfasst werden unter anderem Blinzeln, Augenöffnung, Augenbrauen-, Mund-, Kiefer- und Kopfbewegungen. Kurze Zustände werden nicht automatisch als Mikroexpressionen bezeichnet: Normale Webcams sind dafür oft zu langsam und ungenau.</p></div></article>
        <article><span><AudioLines /></span><div><h2>Optionale Stimmmerkmale</h2><p>Ohne Transkription misst die App Lautstärke, Schwankungen, Pausen, Antwortbeginn und eine grobe Veränderung der Tonhöhe. Das Mikrofon kann jederzeit ausgeschaltet werden.</p></div></article>
        <article><span><Activity /></span><div><h2>Robuste persönliche Baseline</h2><p>Median und Median Absolute Deviation bilden typische Werte und Schwankungsbereiche. Fehlende oder qualitativ schlechte Messungen werden ignoriert oder geringer gewichtet.</p></div></article>
        <article><span><Gauge /></span><div><h2>Abweichungswert</h2><p>Der Prozentwert beschreibt nur die Stärke gemessener Unterschiede. Er ist keine wissenschaftliche Wahrscheinlichkeit und darf nicht zur Beurteilung der Wahrheit einer Aussage verwendet werden.</p></div></article>
      </div>
      <Disclaimer />
    </div>
  )
}
