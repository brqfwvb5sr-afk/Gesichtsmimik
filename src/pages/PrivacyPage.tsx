import { Database, EyeOff, HardDrive, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function PrivacyPage() {
  const { deleteAll } = useApp()
  const [confirm, setConfirm] = useState(false)
  const navigate = useNavigate()
  const erase = () => { deleteAll(); setConfirm(false); navigate('/') }
  return (
    <div className="page narrow">
      <header className="page-header"><span className="eyebrow">Datenschutz</span><h1>Deine Daten bleiben bei dir</h1><p>Die Anwendung wurde so gebaut, dass Kamera-, Mikrofon- und Analysedaten nicht an einen Server gesendet werden.</p></header>
      <div className="privacy-grid">
        <article><ShieldCheck /><h2>Nur im Browser</h2><p>MediaPipe, Web Audio und alle Berechnungen laufen auf deinem Gerät. Es gibt kein Analyse-Backend.</p></article>
        <article><EyeOff /><h2>Keine Aufnahmen</h2><p>Es werden weder Video- noch Audiodateien erstellt, hochgeladen oder dauerhaft gespeichert.</p></article>
        <article><HardDrive /><h2>Lokale Messwerte</h2><p>Nur zusammengefasste Kalibrierungs- und Ergebniswerte liegen in localStorage dieses Browsers.</p></article>
        <article><Database /><h2>Kein Tracking</h2><p>Keine Werbung, keine Analyse-Dienste, keine Cookies für Tracking und keine geheimen API-Schlüssel.</p></article>
        <article><Users /><h2>Einwilligung nötig</h2><p>Analysiere keine andere Person ohne ihre ausdrückliche, informierte Zustimmung.</p></article>
        <article><Trash2 /><h2>Jederzeit löschbar</h2><p>Mit der folgenden Schaltfläche entfernst du Baseline, Verlauf und Einstellungen aus diesem Browser.</p></article>
      </div>
      {!confirm ? <button className="button danger" onClick={() => setConfirm(true)}><Trash2 /> Alle lokalen Daten löschen</button> : <div className="confirm-delete"><p>Wirklich alle lokalen Kalibrierungen und Ergebnisse löschen?</p><button className="button danger" onClick={erase}>Endgültig löschen</button><button className="button ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}
    </div>
  )
}
