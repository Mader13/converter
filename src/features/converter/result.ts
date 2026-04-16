import { getOutputExtension } from './mime-support'
import type {
  ConversionResult,
  OutputFormat,
  SourceImageFile,
} from '../../types/image'

export function createConversionResult(input: {
  blob: Blob
  fileName: string
  outputFormat: OutputFormat
  outputHeight: number
  outputWidth: number
  source: SourceImageFile
}): ConversionResult {
  const savingsBytes = input.source.size - input.blob.size

  return {
    blob: input.blob,
    fileName: input.fileName,
    outputFormat: input.outputFormat,
    outputSize: input.blob.size,
    outputWidth: input.outputWidth,
    outputHeight: input.outputHeight,
    savingsBytes,
    savingsPercent: input.source.size > 0 ? (savingsBytes / input.source.size) * 100 : 0,
  }
}

export function buildResultFileName(
  sourceName: string,
  outputFormat: OutputFormat,
): string {
  const withoutExtension = sourceName.replace(/\.[^.]+$/, '')

  return `${withoutExtension}.${getOutputExtension(outputFormat)}`
}

export function normalizeConversionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected conversion error.'
}
