export const median = (values: number[]): number => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

export const mad = (values: number[], center = median(values)): number =>
  median(values.map((value) => Math.abs(value - center)))

export const mean = (values: number[]): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

export const standardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0
  const average = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)))
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))
