/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { calculateBaseline } from '../analysis/baseline'
import { analyzeRecording } from '../services/analysisWorker'
import { clearState, loadState, saveState } from '../storage/localStore'
import type { AppSettings, CalibrationCategory, RecordingMetrics, StoredState } from '../types/analysis'

type AppContextValue = StoredState & {
  addCalibration: (recording: RecordingMetrics, category: CalibrationCategory) => void
  finishCalibration: () => boolean
  addAnalysis: (recording: RecordingMetrics) => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => void
  deleteAll: () => void
  resetCalibration: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState())

  useEffect(() => { saveState(state) }, [state])
  useEffect(() => {
    const root = document.documentElement
    const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
    root.dataset.theme = dark ? 'dark' : 'light'
    root.classList.toggle('reduce-motion', state.settings.reduceMotion)
  }, [state.settings])

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    addCalibration: (recording, category) => setState((current) => ({
      ...current,
      calibration: [...current.calibration, { ...recording, category }],
    })),
    finishCalibration: () => {
      if (state.calibration.length < 6) return false
      const baseline = calculateBaseline(state.calibration)
      setState((current) => ({ ...current, baseline }))
      return Object.keys(baseline.features).length >= 4
    },
    addAnalysis: async (recording) => {
      if (!state.baseline) return
      const result = await analyzeRecording(recording, state.baseline)
      setState((current) => ({ ...current, history: [{ recording, result }, ...current.history].slice(0, 50) }))
    },
    updateSettings: (settings) => setState((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
    deleteAll: () => { clearState(); setState({ ...loadState(), calibration: [], baseline: null, history: [] }) },
    resetCalibration: () => setState((current) => ({ ...current, calibration: [], baseline: null })),
  }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp muss innerhalb von AppProvider verwendet werden.')
  return context
}
