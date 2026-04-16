/// <reference lib="webworker" />

import {
  buildResultFileName,
  normalizeConversionError,
} from '../features/converter/result'
import { clampQuality } from '../features/converter/mime-support'
import { computeTargetDimensions } from '../features/converter/resize'
import type { WorkerRequestMessage, WorkerResponseMessage } from '../types/image'

const workerScope = self as DedicatedWorkerGlobalScope & typeof globalThis

workerScope.onmessage = async (event: MessageEvent<WorkerRequestMessage>) => {
  const message = event.data

  if (message.type !== 'convert') {
    return
  }

  try {
    postProgress(message.jobId, 12)
    const bitmap = await createImageBitmap(message.file)

    try {
      const target = computeTargetDimensions(
        bitmap.width,
        bitmap.height,
        message.settings,
      )

      postProgress(message.jobId, 46)

      if (typeof OffscreenCanvas === 'undefined') {
        throw new Error('Worker canvas support is unavailable in this browser.')
      }

      const canvas = new OffscreenCanvas(target.width, target.height)
      const context = canvas.getContext('2d', { alpha: true })

      if (!context) {
        throw new Error('Worker 2D context unavailable.')
      }

      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(bitmap, 0, 0, target.width, target.height)

      postProgress(message.jobId, 82)

      const blob = await canvas.convertToBlob({
        type: message.settings.outputFormat,
        quality:
          message.settings.outputFormat === 'image/png'
            ? undefined
            : clampQuality(message.settings.quality),
      })

      if (
        message.settings.outputFormat !== 'image/png' &&
        blob.type !== message.settings.outputFormat
      ) {
        throw new Error(
          `Browser exported ${blob.type} instead of ${message.settings.outputFormat}.`,
        )
      }

      const buffer = await blob.arrayBuffer()

      postProgress(message.jobId, 100)

      const response: WorkerResponseMessage = {
        type: 'success',
        jobId: message.jobId,
        buffer,
        outputFormat: message.settings.outputFormat,
        outputWidth: target.width,
        outputHeight: target.height,
        fileName: buildResultFileName(
          message.sourceName,
          message.settings.outputFormat,
        ),
      }

      workerScope.postMessage(response, [buffer])
    } finally {
      bitmap.close()
    }
  } catch (error) {
    const response: WorkerResponseMessage = {
      type: 'error',
      jobId: message.jobId,
      error: normalizeConversionError(error),
    }

    workerScope.postMessage(response)
  }
}

function postProgress(jobId: string, progress: number) {
  const response: WorkerResponseMessage = {
    type: 'progress',
    jobId,
    progress,
  }

  workerScope.postMessage(response)
}
