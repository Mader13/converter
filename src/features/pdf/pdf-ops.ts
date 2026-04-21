import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument } from 'pdf-lib'
import { buildZipBlob } from '../../lib/zip'
import { downloadBlob } from '../../lib/download'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export async function pdfToJpg(
  files: File[],
  onProgress: (msg: string) => void,
): Promise<void> {
  const entries: { fileName: string; blob: Blob }[] = []

  for (const file of files) {
    onProgress(`Rendering ${file.name}…`)
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages
    const baseName = file.name.replace(/\.pdf$/i, '')

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      await page.render({ canvasContext: ctx, viewport, canvas }).promise

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          0.92,
        )
      })

      const paddedNum = String(pageNum).padStart(3, '0')
      entries.push({ fileName: `${baseName}-page-${paddedNum}.jpg`, blob })
    }
  }

  if (entries.length === 1 && entries[0]) {
    downloadBlob(entries[0].blob, entries[0].fileName)
  } else if (entries.length > 1) {
    const zip = await buildZipBlob(entries)
    downloadBlob(zip, 'pdf-to-jpg.zip')
  }
}

export async function jpgToPdf(
  files: File[],
  onProgress: (msg: string) => void,
): Promise<void> {
  onProgress('Building PDF…')
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    onProgress(`Embedding ${file.name}…`)
    const arrayBuffer = await file.arrayBuffer()
    const img = await pdfDoc.embedJpg(arrayBuffer)
    const { width, height } = img.scale(1)
    const page = pdfDoc.addPage([width, height])
    page.drawImage(img, { x: 0, y: 0, width, height })
  }

  const bytes = await pdfDoc.save()
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  downloadBlob(blob, 'images.pdf')
}

export async function mergePdfs(
  files: File[],
  onProgress: (msg: string) => void,
): Promise<void> {
  onProgress('Merging PDFs…')
  const merged = await PDFDocument.create()

  for (const file of files) {
    onProgress(`Adding ${file.name}…`)
    const bytes = await file.arrayBuffer()
    const doc = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }

  const bytes = await merged.save()
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  downloadBlob(blob, 'merged.pdf')
}

export async function splitPdf(
  file: File,
  onProgress: (msg: string) => void,
): Promise<void> {
  onProgress('Splitting PDF…')
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)
  const pageCount = doc.getPageCount()
  const baseName = file.name.replace(/\.pdf$/i, '')
  const entries: { fileName: string; blob: Blob }[] = []

  for (let i = 0; i < pageCount; i++) {
    onProgress(`Extracting page ${i + 1} / ${pageCount}…`)
    const single = await PDFDocument.create()
    const [page] = await single.copyPages(doc, [i])
    single.addPage(page)
    const pageBytes = await single.save()
    const paddedNum = String(i + 1).padStart(3, '0')
    entries.push({
      fileName: `${baseName}-page-${paddedNum}.pdf`,
      blob: new Blob([pageBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    })
  }

  const zip = await buildZipBlob(entries)
  downloadBlob(zip, `${baseName}-split.zip`)
}
