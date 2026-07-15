export function QualityMeter({ value, label = 'Datenqualität' }: { value: number; label?: string }) {
  const tone = value >= 75 ? 'good' : value >= 55 ? 'medium' : 'bad'
  return (
    <div className="quality-meter">
      <div className="quality-label"><span>{label}</span><strong>{Math.round(value)} %</strong></div>
      <div className="meter-track" aria-label={`${label}: ${Math.round(value)} Prozent`}>
        <span className={tone} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
    </div>
  )
}
