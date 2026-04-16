export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export type JobStatus = 'idle' | 'queued' | 'processing' | 'done' | 'error'

export interface SourceImageFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  width: number
  height: number
  previewUrl: string
}

export interface ConversionSettings {
  outputFormat: OutputFormat
  quality: number
  resizeMode: 'none' | 'width' | 'height' | 'exact'
  width?: number
  height?: number
  keepAspectRatio: boolean
}

export interface ConversionResult {
  blob: Blob
  fileName: string
  outputFormat: OutputFormat
  outputSize: number
  outputWidth: number
  outputHeight: number
  savingsBytes: number
  savingsPercent: number
}

export interface ConversionJob {
  id: string
  source: SourceImageFile
  status: JobStatus
  progress: number
  error?: string
  result?: ConversionResult
}

export interface WorkerRequestMessage {
  type: 'convert'
  jobId: string
  file: File
  settings: ConversionSettings
  sourceName: string
}

export interface WorkerProgressMessage {
  type: 'progress'
  jobId: string
  progress: number
}

export interface WorkerSuccessMessage {
  type: 'success'
  jobId: string
  buffer: ArrayBuffer
  outputFormat: OutputFormat
  outputHeight: number
  outputWidth: number
  fileName: string
}

export interface WorkerErrorMessage {
  type: 'error'
  jobId: string
  error: string
}

export type WorkerResponseMessage =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerErrorMessage
