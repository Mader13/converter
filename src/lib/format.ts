import { getOutputExtension, getOutputFormatLabel } from '../features/converter/mime-support'

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`
}

export function getFormatLabel(type: string): string {
  if (type === 'image/png' || type === 'image/jpeg' || type === 'image/webp') {
    return getOutputFormatLabel(type)
  }

  return type.replace('image/', '').toUpperCase()
}

export function replaceFileExtension(
  fileName: string,
  outputType: 'image/png' | 'image/jpeg' | 'image/webp',
): string {
  return `${fileName.replace(/\.[^.]+$/, '')}.${getOutputExtension(outputType)}`
}
