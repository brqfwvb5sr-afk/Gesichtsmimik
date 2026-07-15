import type { AppSettings, StoredState } from '../types/analysis'

export const STORAGE_KEY = 'baseline-lab-state-v1'

export const defaultSettings: AppSettings = {
  theme: 'system',
  microphoneEnabled: true,
  reduceMotion: false,
}

export const emptyState = (): StoredState => ({
  version: 1,
  calibration: [],
  baseline: null,
  history: [],
  settings: defaultSettings,
})

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.version !== 1) return emptyState()
    return { ...emptyState(), ...parsed, settings: { ...defaultSettings, ...parsed.settings } }
  } catch {
    return emptyState()
  }
}

export function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
