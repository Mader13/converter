import { APP_LIMITS } from './constants'
import { isSupportedInputType } from './mime-support'
import type { ConversionJob, SourceImageFile } from '../../types/image'

export interface IntakeResult {
  accepted: ConversionJob[]
  rejected: string[]
}

export async function intakeFiles(
  files: File[],
  existingJobs: ConversionJob[],
): Promise<IntakeResult> {
  const rejected: string[] = []
  const accepted: ConversionJob[] = []

  const remainingCapacity = APP_LIMITS.maxBatchFiles - existingJobs.length
  const knownFingerprints = new Set(existingJobs.map((job) => fingerprint(job.source.file)))

  if (remainingCapacity <= 0) {
    return {
      accepted,
      rejected: [`Batch limit reached. Maximum ${APP_LIMITS.maxBatchFiles} files.`],
    }
  }

  const selectedFiles = files.slice(0, remainingCapacity)

  if (files.length > selectedFiles.length) {
    rejected.push(`Only first ${remainingCapacity} files were added to keep batch size safe.`)
  }

  for (const file of selectedFiles) {
    const fileFingerprint = fingerprint(file)

    if (knownFingerprints.has(fileFingerprint)) {
      rejected.push(`${file.name}: duplicate skipped.`)
      continue
    }

    try {
      const source = await loadSourceImage(file)
      accepted.push({
        id: source.id,
        source,
        status: 'idle',
        progress: 0,
      })
      knownFingerprints.add(fileFingerprint)
    } catch (error) {
      rejected.push(normalizeError(error, file.name))
    }
  }

  return { accepted, rejected }
}

export async function loadSourceImage(file: File): Promise<SourceImageFile> {
  validateSourceFile(file)

  const previewUrl = URL.createObjectURL(file)

  try {
    const dimensions = await readDimensions(file, previewUrl)

    return {
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type || inferMimeTypeFromName(file.name),
      width: dimensions.width,
      height: dimensions.height,
      previewUrl,
    }
  } catch (error) {
    URL.revokeObjectURL(previewUrl)
    throw error
  }
}

function validateSourceFile(file: File): void {
  if (!isSupportedInputType(file.type, file.name)) {
    throw new Error('Unsupported input type. Use PNG, JPEG, or WebP.')
  }

  if (file.size > APP_LIMITS.maxFileSizeBytes) {
    throw new Error(
      `File exceeds ${Math.round(APP_LIMITS.maxFileSizeBytes / 1024 / 1024)} MB limit.`,
    )
  }
}

async function readDimensions(
  file: File,
  previewUrl: string,
): Promise<{ height: number; width: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)

    try {
      return { width: bitmap.width, height: bitmap.height }
    } finally {
      bitmap.close()
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }
    image.onerror = () => reject(new Error('Image decode failed.'))
    image.src = previewUrl
  })
}

function inferMimeTypeFromName(fileName: string): SourceImageFile['type'] {
  const lowerCaseName = fileName.toLowerCase()

  if (lowerCaseName.endsWith('.png')) {
    return 'image/png'
  }

  if (lowerCaseName.endsWith('.webp')) {
    return 'image/webp'
  }

  return 'image/jpeg'
}

function fingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function normalizeError(error: unknown, fallbackFileName: string): string {
  if (error instanceof Error) {
    return `${fallbackFileName}: ${error.message}`
  }

  return `${fallbackFileName}: failed to add file.`
}
