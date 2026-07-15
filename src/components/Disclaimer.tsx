import { ShieldAlert } from 'lucide-react'

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`disclaimer ${compact ? 'compact' : ''}`} role="note">
      <ShieldAlert aria-hidden="true" />
      <p><strong>Kein Lügendetektor.</strong> Eine Abweichung ist kein Beweis für eine Lüge. Stress, Unsicherheit, Konzentration, Müdigkeit, Lichtverhältnisse und viele weitere Faktoren können das Ergebnis beeinflussen.</p>
    </div>
  )
}
