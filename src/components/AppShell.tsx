import { BarChart3, Brain, FlaskConical, History, Home, Menu, Moon, ScanFace, Settings, Shield, Sun, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navigation = [
  ['/', 'Start', Home], ['/erklaerung', 'Erklärung', Brain], ['/kalibrierung', 'Kalibrierung', FlaskConical],
  ['/analyse', 'Analyse', ScanFace], ['/ergebnisse', 'Ergebnisse', BarChart3], ['/verlauf', 'Verlauf', History],
  ['/datenschutz', 'Datenschutz', Shield], ['/einstellungen', 'Einstellungen', Settings],
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { updateSettings, baseline } = useApp()
  const dark = document.documentElement.dataset.theme === 'dark'
  const toggleTheme = () => updateSettings({ theme: dark ? 'light' : 'dark' })
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand"><span className="brand-mark"><ScanFace /></span><span>Baseline<span className="brand-dot">.</span></span></NavLink>
        <div className="top-actions">
          {baseline && <span className="baseline-ready"><i /> Baseline bereit</span>}
          <button className="icon-button" onClick={toggleTheme} aria-label="Farbschema wechseln">{dark ? <Sun /> : <Moon />}</button>
          <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label="Menü öffnen">{open ? <X /> : <Menu />}</button>
        </div>
      </header>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav aria-label="Hauptnavigation">
          {navigation.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><Icon /><span>{label}</span></NavLink>)}
        </nav>
        <p className="sidebar-note">Lokale Forschung · keine Diagnose<br />Keine Datenübertragung</p>
      </aside>
      {open && <button className="backdrop" aria-label="Menü schliessen" onClick={() => setOpen(false)} />}
      <main className="content">{children}</main>
    </div>
  )
}
