/* eslint-disable react-refresh/only-export-components */
import { useState, type FormEvent, type ReactNode } from 'react'
import { KeyRound, LockKeyhole, ScanFace } from 'lucide-react'

const SESSION_KEY = 'baseline-access-granted'
const ACCESS_CODE = 'Penis'

export const verifyAccessCode = (value: string): boolean =>
  value.trim().toLocaleLowerCase('de-CH') === ACCESS_CODE.toLocaleLowerCase('de-CH')

export function AccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'yes')
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!verifyAccessCode(code)) {
      setError(true)
      return
    }
    sessionStorage.setItem(SESSION_KEY, 'yes')
    setUnlocked(true)
  }

  if (unlocked) return children

  return (
    <main className="access-page">
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-brand"><span><ScanFace /></span>Baseline.</div>
        <div className="access-icon"><LockKeyhole /></div>
        <span className="eyebrow">Geschützter Testzugang</span>
        <h1 id="access-title">Zugang erforderlich</h1>
        <p>Diese Forschungsanwendung befindet sich im privaten Testbetrieb. Gib den Zugangscode ein, um fortzufahren.</p>
        <form onSubmit={submit}>
          <label htmlFor="access-code">Zugangscode</label>
          <div className={`access-input ${error ? 'invalid' : ''}`}>
            <KeyRound aria-hidden="true" />
            <input
              id="access-code"
              type="password"
              value={code}
              onChange={(event) => { setCode(event.target.value); setError(false) }}
              autoComplete="current-password"
              autoFocus
              aria-invalid={error}
              aria-describedby={error ? 'access-error' : undefined}
              placeholder="Code eingeben"
            />
          </div>
          {error && <p id="access-error" className="access-error" role="alert">Der Zugangscode ist nicht korrekt.</p>}
          <button className="button primary wide" type="submit">Zugang öffnen</button>
        </form>
        <small>Die Freigabe gilt nur für diese Browser-Sitzung.</small>
      </section>
    </main>
  )
}
