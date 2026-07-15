import { Mic, Moon, Move, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'

export function SettingsPage() {
  const { settings, updateSettings } = useApp()
  return (
    <div className="page narrow">
      <header className="page-header"><span className="eyebrow">Einstellungen</span><h1>Darstellung und Aufnahme</h1></header>
      <div className="settings-list">
        <label><span className="setting-icon"><Moon /></span><span><strong>Farbschema</strong><small>Hell, dunkel oder passend zum Gerät</small></span><select value={settings.theme} onChange={(event) => updateSettings({ theme: event.target.value as typeof settings.theme })}><option value="system">System</option><option value="light">Hell</option><option value="dark">Dunkel</option></select></label>
        <label><span className="setting-icon"><Mic /></span><span><strong>Optionale Stimmanalyse</strong><small>Die App funktioniert auch vollständig ohne Mikrofon</small></span><input type="checkbox" checked={settings.microphoneEnabled} onChange={(event) => updateSettings({ microphoneEnabled: event.target.checked })} /></label>
        <label><span className="setting-icon"><Move /></span><span><strong>Bewegungen reduzieren</strong><small>Animationen und Übergänge minimieren</small></span><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => updateSettings({ reduceMotion: event.target.checked })} /></label>
      </div>
      <div className="settings-note"><Settings /><p>Die Mikrofon-Einstellung betrifft nur neue Aufnahmen. Bestehende lokale Messwerte werden dadurch nicht verändert.</p></div>
    </div>
  )
}
