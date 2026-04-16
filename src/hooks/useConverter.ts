import { startTransition, useEffect, useRef, useState } from 'react'
import { APP_LIMITS } from '../features/converter/constants'
import {
  convertImage,
  createDefaultSettings,
} from '../features/converter/converter'
import { intakeFiles } from '../features/converter/image-load'
import { getAvailableOutputFormats } from '../features/converter/mime-support'
import { runWithConcurrencyLimit } from '../features/converter/queue'
import { downloadBlob } from '../lib/download'
import { buildZipBlob } from '../lib/zip'
import type {
  ConversionJob,
  ConversionSettings,
  OutputFormat,
} from '../types/image'

export interface BatchSummary {
  completed: number
  failed: number
  netSavingsBytes: number
  netSavingsPercent: number
  processing: number
  total: number
  totalInputBytes: number
  totalOutputBytes: number
}

interface Notice {
  message: string
  tone: 'neutral' | 'success' | 'warning'
}

export function useConverter() {
  const [jobs, setJobs] = useState<ConversionJob[]>([])
  const [settings, setSettings] = useState<ConversionSettings>(() =>
    createDefaultSettings(),
  )
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [availableOutputFormats, setAvailableOutputFormats] = useState<OutputFormat[]>(
    () => getAvailableOutputFormats(),
  )

  const jobsRef = useRef<ConversionJob[]>([])
  const previewRegistryRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    jobsRef.current = jobs

    const nextRegistry = new Map(
      jobs.map((job) => [job.id, job.source.previewUrl] as const),
    )

    for (const [jobId, previewUrl] of previewRegistryRef.current.entries()) {
      if (!nextRegistry.has(jobId)) {
        URL.revokeObjectURL(previewUrl)
      }
    }

    previewRegistryRef.current = nextRegistry
  }, [jobs])

  useEffect(() => {
    const supportedFormats = getAvailableOutputFormats()
    setAvailableOutputFormats(supportedFormats)
    const fallbackFormat = supportedFormats[0]

    if (
      fallbackFormat &&
      supportedFormats.length > 0 &&
      !supportedFormats.includes(settings.outputFormat)
    ) {
      setSettings((current) => ({
        ...current,
        outputFormat: fallbackFormat,
      }))
    }
  }, [settings.outputFormat])

  useEffect(() => {
    return () => {
      for (const previewUrl of previewRegistryRef.current.values()) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  async function addFiles(files: File[]) {
    if (files.length === 0) {
      return
    }

    setIsLoadingFiles(true)

    try {
      const intake = await intakeFiles(files, jobsRef.current)

      if (intake.accepted.length > 0) {
        startTransition(() => {
          setJobs((current) => [...current, ...intake.accepted])
        })
      }

      if (intake.rejected.length > 0) {
        setNotice({
          tone: intake.accepted.length > 0 ? 'neutral' : 'warning',
          message: intake.rejected.join(' '),
        })
      } else {
        setNotice({
          tone: 'success',
          message: `${intake.accepted.length} file(s) added to queue.`,
        })
      }
    } finally {
      setIsLoadingFiles(false)
    }
  }

  function removeJob(jobId: string) {
    if (isProcessing) {
      return
    }

    setJobs((current) => current.filter((job) => job.id !== jobId))
  }

  function clearJobs() {
    if (isProcessing) {
      return
    }

    setJobs([])
    setNotice(null)
  }

  function updateSettings(next: Partial<ConversionSettings>) {
    setSettings((current) => ({ ...current, ...next }))
  }

  async function convertAll() {
    const queuedJobs = jobsRef.current

    if (queuedJobs.length === 0 || isProcessing) {
      return
    }

    setIsProcessing(true)
    setNotice({
      tone: 'neutral',
      message: 'Batch started. Conversion runs locally in worker queue.',
    })

    setJobs((current) =>
      current.map((job) => ({
        ...job,
        status: 'queued',
        progress: 0,
        error: undefined,
        result: undefined,
      })),
    )

    const snapshotSettings = { ...settings }

    try {
      await runWithConcurrencyLimit(
        queuedJobs,
        APP_LIMITS.workerConcurrency,
        async (job) => {
          setJobState(job.id, {
            status: 'processing',
            progress: 12,
            error: undefined,
            result: undefined,
          })

          try {
            const result = await convertImage(
              {
                source: job.source,
                settings: snapshotSettings,
              },
              (progress) => {
                setJobState(job.id, {
                  status: 'processing',
                  progress,
                })
              },
            )

            setJobState(job.id, {
              status: 'done',
              progress: 100,
              result,
              error: undefined,
            })
          } catch (error) {
            setJobState(job.id, {
              status: 'error',
              progress: 100,
              error: error instanceof Error ? error.message : 'Conversion failed.',
              result: undefined,
            })
          }
        },
      )

      const latestJobs = jobsRef.current
      const completed = latestJobs.filter((job) => job.status === 'done').length
      const failed = latestJobs.filter((job) => job.status === 'error').length

      setNotice({
        tone: failed > 0 ? 'warning' : 'success',
        message:
          failed > 0
            ? `Batch finished with partial failures. Ready: ${completed}, failed: ${failed}.`
            : `Batch finished. ${completed} file(s) ready for download.`,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  function downloadResult(jobId: string) {
    const job = jobsRef.current.find((entry) => entry.id === jobId)

    if (!job?.result) {
      return
    }

    downloadBlob(job.result.blob, job.result.fileName)
  }

  async function downloadAllResults() {
    const readyJobs = jobsRef.current.filter((job) => job.result)

    if (readyJobs.length === 0) {
      return
    }

    const zipBlob = await buildZipBlob(
      readyJobs.map((job) => ({
        fileName: job.result!.fileName,
        blob: job.result!.blob,
      })),
    )

    downloadBlob(zipBlob, 'minti-converter-results.zip')
  }

  const summary = buildSummary(jobs)

  return {
    jobs,
    notice,
    settings,
    summary,
    isLoadingFiles,
    isProcessing,
    availableOutputFormats,
    addFiles,
    removeJob,
    clearJobs,
    convertAll,
    downloadResult,
    downloadAllResults,
    updateSettings,
  }

  function setJobState(jobId: string, nextState: Partial<ConversionJob>) {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, ...nextState } : job)),
    )
  }
}

function buildSummary(jobs: ConversionJob[]): BatchSummary {
  const completedJobs = jobs.filter((job) => job.result)
  const totalInputBytes = jobs.reduce((sum, job) => sum + job.source.size, 0)
  const totalOutputBytes = completedJobs.reduce(
    (sum, job) => sum + (job.result?.outputSize ?? 0),
    0,
  )
  const netSavingsBytes = totalInputBytes - totalOutputBytes

  return {
    total: jobs.length,
    completed: completedJobs.length,
    failed: jobs.filter((job) => job.status === 'error').length,
    processing: jobs.filter(
      (job) => job.status === 'queued' || job.status === 'processing',
    ).length,
    totalInputBytes,
    totalOutputBytes,
    netSavingsBytes,
    netSavingsPercent:
      totalInputBytes > 0 ? (netSavingsBytes / totalInputBytes) * 100 : 0,
  }
}
