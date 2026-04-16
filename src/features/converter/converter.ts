import { convertOnMainThread } from './image-export'
import { createConversionResult } from './result'
import type {
  ConversionResult,
  ConversionSettings,
  SourceImageFile,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from '../../types/image'

export interface ConversionTaskInput {
  settings: ConversionSettings
  source: SourceImageFile
}

export async function convertImage(
  input: ConversionTaskInput,
  onProgress?: (progress: number) => void,
): Promise<ConversionResult> {
  if (canUseWorkerConversion(input.source.type)) {
    return convertWithWorker(input, onProgress)
  }

  return convertOnMainThread(input, onProgress)
}

export function createDefaultSettings(): ConversionSettings {
  return {
    outputFormat: 'image/webp',
    quality: 0.82,
    resizeMode: 'none',
    width: undefined,
    height: undefined,
    keepAspectRatio: true,
  }
}

function canUseWorkerConversion(sourceType: SourceImageFile['type']): boolean {
  // WebP decode can stall inside worker createImageBitmap() in some browsers.
  // Keep conversion reliable by using main-thread canvas path for WebP inputs.
  if (sourceType === 'image/webp') {
    return false
  }

  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    typeof createImageBitmap === 'function'
  )
}

async function convertWithWorker(
  input: ConversionTaskInput,
  onProgress?: (progress: number) => void,
): Promise<ConversionResult> {
  const worker = new Worker(new URL('../../workers/convert.worker.ts', import.meta.url), {
    type: 'module',
  })

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.terminate()
    }

    worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
      const message = event.data

      if (message.type === 'progress') {
        onProgress?.(message.progress)
        return
      }

      if (message.type === 'error') {
        cleanup()
        reject(new Error(message.error))
        return
      }

      const blob = new Blob([message.buffer], { type: message.outputFormat })

      cleanup()
      resolve(
        createConversionResult({
          source: input.source,
          blob,
          outputFormat: message.outputFormat,
          outputWidth: message.outputWidth,
          outputHeight: message.outputHeight,
          fileName: message.fileName,
        }),
      )
    }

    worker.onerror = () => {
      cleanup()
      reject(new Error('Worker failed during image conversion.'))
    }

    const request: WorkerRequestMessage = {
      type: 'convert',
      jobId: input.source.id,
      file: input.source.file,
      settings: input.settings,
      sourceName: input.source.name,
    }

    worker.postMessage(request)
  })
}
