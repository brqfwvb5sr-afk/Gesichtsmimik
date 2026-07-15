import type { TimePoint } from '../types/analysis'

const colors = { eye: '#54d6bd', expression: '#8b7cf6', volume: '#ff9a62', head: '#55a6ff' }

export function LineChart({ data, series = ['eye', 'expression'] }: { data: TimePoint[]; series?: Array<keyof typeof colors> }) {
  if (data.length < 2) return <div className="empty-chart">Noch keine ausreichenden Verlaufsdaten.</div>
  const width = 700, height = 220, pad = 20
  const maxT = Math.max(...data.map((point) => point.t), 1)
  const maxY = Math.max(...data.flatMap((point) => series.map((key) => Number(point[key] ?? 0))), 1)
  const pathFor = (key: keyof typeof colors) => data.map((point, index) => {
    const x = pad + (point.t / maxT) * (width - pad * 2)
    const y = height - pad - (Number(point[key] ?? 0) / maxY) * (height - pad * 2)
    return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Zeitlicher Verlauf der Messwerte">
        {[0.25, 0.5, 0.75].map((value) => <line key={value} x1={pad} x2={width-pad} y1={height*value} y2={height*value} className="grid-line" />)}
        {series.map((key) => <path key={key} d={pathFor(key)} fill="none" stroke={colors[key]} strokeWidth="3" strokeLinecap="round" />)}
      </svg>
      <div className="chart-legend">{series.map((key) => <span key={key}><i style={{ background: colors[key] }} />{key === 'eye' ? 'Augenöffnung' : key === 'expression' ? 'Ausdrucksänderung' : key === 'volume' ? 'Lautstärke' : 'Kopfbewegung'}</span>)}</div>
    </div>
  )
}
