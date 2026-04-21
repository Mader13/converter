export type PdfTool =
  | 'pdf-to-jpg'
  | 'jpg-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'

export type PdfJobStatus = 'idle' | 'ready' | 'processing' | 'done' | 'error'

export interface PdfFileEntry {
  id: string
  file: File
  name: string
  size: number
}
