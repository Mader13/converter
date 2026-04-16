export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  return (
    new Intl.NumberFormat('en', {
      maximumFractionDigits: bytes < 1024 * 1024 ? 0 : 1,
    }).format(bytes / getUnitFactor(bytes)) + ` ${getUnitLabel(bytes)}`
  )
}

export function formatSignedPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '0%'
  }

  const prefix = value > 0 ? '-' : value < 0 ? '+' : ''

  return `${prefix}${Math.abs(value).toFixed(1)}%`
}

function getUnitFactor(bytes: number): number {
  if (bytes >= 1024 * 1024 * 1024) {
    return 1024 * 1024 * 1024
  }

  if (bytes >= 1024 * 1024) {
    return 1024 * 1024
  }

  if (bytes >= 1024) {
    return 1024
  }

  return 1
}

function getUnitLabel(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return 'GB'
  }

  if (bytes >= 1024 * 1024) {
    return 'MB'
  }

  if (bytes >= 1024) {
    return 'KB'
  }

  return 'B'
}
