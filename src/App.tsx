import { HashRouter, Route, Routes } from 'react-router-dom'
import { AccessGate } from './components/AccessGate'
import { AppShell } from './components/AppShell'
import { AppProvider } from './context/AppContext'
import { AnalysisPage } from './pages/AnalysisPage'
import { CalibrationPage } from './pages/CalibrationPage'
import { ExplanationPage } from './pages/ExplanationPage'
import { HistoryPage } from './pages/HistoryPage'
import { HomePage } from './pages/HomePage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ResultsPage } from './pages/ResultsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return <AccessGate><HashRouter><AppProvider><AppShell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/erklaerung" element={<ExplanationPage />} />
    <Route path="/kalibrierung" element={<CalibrationPage />} />
    <Route path="/analyse" element={<AnalysisPage />} />
    <Route path="/ergebnisse" element={<ResultsPage />} />
    <Route path="/verlauf" element={<HistoryPage />} />
    <Route path="/datenschutz" element={<PrivacyPage />} />
    <Route path="/einstellungen" element={<SettingsPage />} />
    <Route path="*" element={<HomePage />} />
  </Routes></AppShell></AppProvider></HashRouter></AccessGate>
}
