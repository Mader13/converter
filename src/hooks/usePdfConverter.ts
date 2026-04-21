import { useState } from 'react'
import type { PdfFileEntry, PdfJobStatus, PdfTool } from '../types/pdf'
import { jpgToPdf, mergePdfs, pdfToJpg, splitPdf } from '../features/pdf/pdf-ops'

let nextId = 1
function makeId() {
  return `pdf-${nextId++}`
}

const PDF_ACCEPT = ['application/pdf']
const JPG_ACCEPT = ['image/jpeg']

function isMimeAccepted(file: File, accepted: string[]) {
  return accepted.includes(file.type)
}

export function usePdfConverter() {
  const [tool, setTool] = useState<PdfTool>('pdf-to-jpg')
  const [files, setFiles] = useState<PdfFileEntry[]>([])
  const [status, setStatus] = useState<PdfJobStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  function selectTool(next: PdfTool) {
    setTool(next)
    setFiles([])
    setStatus('idle')
    setStatusMessage('')
  }

  function acceptedMimes(t: PdfTool): string[] {
    return t === 'jpg-to-pdf' ? JPG_ACCEPT : PDF_ACCEPT
  }

  function addFiles(incoming: File[]) {
    const allowed = acceptedMimes(tool)
    const valid = incoming.filter((f) => isMimeAccepted(f, allowed))

    if (valid.length === 0) return

    const entries: PdfFileEntry[] = valid.map((f) => ({
      id: makeId(),
      file: f,
      name: f.name,
      size: f.size,
    }))

    if (tool === 'split-pdf') {
      const first = entries[0]
      if (first) setFiles([first])
    } else {
      setFiles((prev) => [...prev, ...entries])
    }

    setStatus('ready')
    setStatusMessage('')
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      if (next.length === 0) setStatus('idle')
      return next
    })
  }

  function clearFiles() {
    setFiles([])
    setStatus('idle')
    setStatusMessage('')
  }

  function moveFile(id: string, dir: -1 | 1) {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx < 0) return prev
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      const a = next[idx]
      const b = next[swapIdx]
      if (!a || !b) return prev
      next[idx] = b
      next[swapIdx] = a
      return next
    })
  }

  function canRun(): boolean {
    if (status === 'processing') return false
    if (files.length === 0) return false
    if (tool === 'merge-pdf' && files.length < 2) return false
    return true
  }

  async function run() {
    if (!canRun()) return

    setStatus('processing')
    const onProgress = (msg: string) => setStatusMessage(msg)

    try {
      switch (tool) {
        case 'pdf-to-jpg':
          await pdfToJpg(
            files.map((f) => f.file),
            onProgress,
          )
          break
        case 'jpg-to-pdf':
          await jpgToPdf(
            files.map((f) => f.file),
            onProgress,
          )
          break
        case 'merge-pdf':
          await mergePdfs(
            files.map((f) => f.file),
            onProgress,
          )
          break
        case 'split-pdf': {
          const f = files[0]
          if (f) await splitPdf(f.file, onProgress)
          break
        }
      }
      setStatus('done')
      setStatusMessage('')
    } catch (err) {
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'Operation failed.')
    }
  }

  return {
    tool,
    files,
    status,
    statusMessage,
    canRun: canRun(),
    acceptedMimes,
    selectTool,
    addFiles,
    removeFile,
    clearFiles,
    moveFile,
    run,
  }
}
