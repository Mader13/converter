import {
  type ConversionTaskInput,
} from './converter'
import { clampQuality, supportsCanvasExport } from './mime-support'
import {
  buildResultFileName,
  createConversionResult,
  normalizeConversionError,
} from './result'
import { computeTargetDimensions } from './resize'

export async function convertOnMainThread(
  input: ConversionTaskInput,
  onProgress?: (progress: number) => void,
) {
  if (!supportsCanvasExport(input.settings.outputFormat)) {
    throw new Error('Selected output format is not supported in this browser.')
  }

  onProgress?.(10)

  const bitmap = await createImageBitmap(input.source.file)

  try {
    const target = computeTargetDimensions(
      bitmap.width,
      bitmap.height,
      input.settings,
    )

    onProgress?.(45)

    const canvas = document.createElement('canvas')
    canvas.width = target.width
    canvas.height = target.height

    const context = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: false,
    })

    if (!context) {
      throw new Error('2D canvas context unavailable.')
    }

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(bitmap, 0, 0, target.width, target.height)

    onProgress?.(80)

    const quality =
      input.settings.outputFormat === 'image/png'
        ? undefined
        : clampQuality(input.settings.quality)

    const blob = await canvasToBlob(canvas, input.settings.outputFormat, quality)

    onProgress?.(100)

    return createConversionResult({
      source: input.source,
      blob,
      outputFormat: input.settings.outputFormat,
      outputWidth: target.width,
      outputHeight: target.height,
      fileName: buildResultFileName(input.source.name, input.settings.outputFormat),
    })
  } catch (error) {
    throw new Error(normalizeConversionError(error))
  } finally {
    bitmap.close()
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  outputFormat: ConversionTaskInput['settings']['outputFormat'],
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export returned empty blob.'))
          return
        }

        if (outputFormat !== 'image/png' && blob.type !== outputFormat) {
          reject(new Error(`Browser exported ${blob.type} instead of ${outputFormat}.`))
          return
        }

        resolve(blob)
      },
      outputFormat,
      quality,
    )
  })
}
