import { beforeEach, describe, expect, it } from 'vitest'
import { clearState, emptyState, loadState, saveState, STORAGE_KEY } from './localStore'

describe('local storage', () => {
  beforeEach(() => localStorage.clear())
  it('saves and loads the local app state', () => {
    const state = emptyState()
    state.settings.microphoneEnabled = false
    saveState(state)
    expect(loadState().settings.microphoneEnabled).toBe(false)
  })
  it('recovers safely from invalid data', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(loadState().version).toBe(1)
    expect(loadState().baseline).toBeNull()
  })
  it('deletes all persisted analysis data', () => {
    saveState(emptyState())
    clearState()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
