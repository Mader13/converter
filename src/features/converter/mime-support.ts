import type { OutputFormat } from '../../types/image'

export const SUPPORTED_INPUT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export const ACCEPTED_FILE_MAP = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
} as const

export const OUTPUT_FORMAT_OPTIONS: Array<{
  value: OutputFormat
}> = [
  { value: 'image/png' },
  { value: 'image/jpeg' },
  { value: 'image/webp' },
]

const FILE_EXTENSION_BY_MIME: Record<OutputFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const FILE_LABEL_BY_MIME: Record<OutputFormat, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
}

export function isSupportedInputType(type: string, fileName?: string): boolean {
  if ((SUPPORTED_INPUT_TYPES as readonly string[]).includes(type)) {
    return true
  }

  const lowerCaseName = fileName?.toLowerCase() ?? ''

  return (
    lowerCaseName.endsWith('.png') ||
    lowerCaseName.endsWith('.jpg') ||
    lowerCaseName.endsWith('.jpeg') ||
    lowerCaseName.endsWith('.webp')
  )
}

export function getAvailableOutputFormats(): OutputFormat[] {
  return OUTPUT_FORMAT_OPTIONS.filter((option) => supportsCanvasExport(option.value)).map(
    (option) => option.value,
  )
}

export function supportsCanvasExport(format: OutputFormat): boolean {
  if (typeof document === 'undefined') {
    return true
  }

  if (format === 'image/png') {
    return true
  }

  const canvas = document.createElement('canvas')

  try {
    return canvas.toDataURL(format).startsWith(`data:${format}`)
  } catch {
    return false
  }
}

export function clampQuality(value: number): number {
  return Math.min(1, Math.max(0.4, value))
}

export function getOutputExtension(format: OutputFormat): string {
  return FILE_EXTENSION_BY_MIME[format]
}

export function getOutputFormatLabel(format: OutputFormat): string {
  return FILE_LABEL_BY_MIME[format]
}
