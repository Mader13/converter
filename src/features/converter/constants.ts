export const APP_LIMITS = {
  maxBatchFiles: 20,
  maxFileSizeBytes: 25 * 1024 * 1024,
  maxOutputDimension: 8192,
  workerConcurrency: 2,
} as const
