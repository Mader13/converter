import { useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatBytes } from '../lib/filesize'
import type { AppText } from '../i18n/text'
import type { PdfTool } from '../types/pdf'
import { usePdfConverter } from '../hooks/usePdfConverter'

const PDF_TOOLS: PdfTool[] = ['pdf-to-jpg', 'jpg-to-pdf', 'merge-pdf', 'split-pdf']

interface PdfSectionProps {
  text: AppText['pdf']
}

export function PdfSection({ text }: PdfSectionProps) {
  const pdf = usePdfConverter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mimes = pdf.acceptedMimes(pdf.tool)
  const acceptMap = Object.fromEntries(mimes.map((m) => [m, []]))
  const isSingleFileTool = pdf.tool === 'split-pdf'

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: acceptMap,
    multiple: !isSingleFileTool,
    noClick: true,
    onDrop: (accepted: File[]) => pdf.addFiles(accepted),
  })

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    if (picked.length > 0) pdf.addFiles(picked)
    e.target.value = ''
  }

  const isBusy = pdf.status === 'processing'
  const isDone = pdf.status === 'done'
  const isError = pdf.status === 'error'
  const mergeBlocked = pdf.tool === 'merge-pdf' && pdf.files.length < 2

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <section className="panel sm:col-span-2">
        <div className="window-title">
          <span>{text.title}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PDF_TOOLS.map((t) => {
            const active = pdf.tool === t
            return (
              <button
                key={t}
                type="button"
                className="btn"
                style={
                  active
                    ? {
                        borderTop: '2px solid var(--border-dark)',
                        borderLeft: '2px solid var(--border-dark)',
                        borderRight: '2px solid var(--border-light)',
                        borderBottom: '2px solid var(--border-light)',
                        background: '#ffffff',
                      }
                    : {}
                }
                onClick={() => pdf.selectTool(t)}
              >
                {text.tools[t]}
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="window-title">
          <span>{text.tools[pdf.tool]}</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={mimes.join(',')}
          multiple={!isSingleFileTool}
          style={{ display: 'none' }}
          onChange={onFileInputChange}
        />

        <div
          {...getRootProps()}
          className={`panel-inset text-center py-8 h-[200px] flex flex-col items-center justify-center gap-4 ${
            isDragActive ? 'bg-blue-100' : ''
          } ${isBusy ? 'opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="font-bold">{text.dropHint[pdf.tool]}</div>
          <button
            className="btn"
            type="button"
            disabled={isBusy}
            onClick={openFilePicker}
          >
            {text.browse}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-success flex-1 py-2"
            type="button"
            disabled={!pdf.canRun || isBusy}
            onClick={pdf.run}
          >
            {isBusy ? text.running : text.run}
          </button>
          <button
            className="btn"
            type="button"
            disabled={isBusy || pdf.files.length === 0}
            onClick={pdf.clearFiles}
          >
            {text.clear}
          </button>
        </div>

        {isBusy && pdf.statusMessage && (
          <div className="mt-2 panel-inset text-sm px-2 py-1">
            {pdf.statusMessage}
          </div>
        )}
        {isDone && (
          <div className="mt-2 panel-inset text-sm px-2 py-1 font-bold">
            {text.statusDone}
          </div>
        )}
        {isError && (
          <div className="mt-2 panel-inset text-sm px-2 py-1 font-bold text-red-700">
            {text.statusError}: {pdf.statusMessage}
          </div>
        )}
        {mergeBlocked && !isBusy && (
          <div className="mt-2 text-xs text-(--text-muted)">{text.mergeMin}</div>
        )}
      </section>

      <section className="panel">
        <div className="window-title">
          <span>
            {pdf.files.length > 0
              ? `${pdf.files.length} file${pdf.files.length === 1 ? '' : 's'}`
              : text.noFiles}
          </span>
        </div>

        {pdf.files.length === 0 ? (
          <div className="panel-inset text-center py-6 text-(--text-muted) text-sm">
            {text.noFiles}
          </div>
        ) : (
          <ul className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
            {pdf.files.map((f, idx) => (
              <li
                key={f.id}
                className="panel-inset flex items-center gap-2 px-2 py-1"
              >
                <span className="text-xs font-bold w-5 shrink-0 text-right text-(--text-muted)">
                  {idx + 1}
                </span>
                <span className="flex-1 min-w-0 text-sm truncate" title={f.name}>
                  {f.name}
                </span>
                <span className="text-xs text-(--text-muted) shrink-0">
                  {formatBytes(f.size)}
                </span>
                {(pdf.tool === 'jpg-to-pdf' || pdf.tool === 'merge-pdf') && (
                  <>
                    <button
                      className="btn text-xs px-1 py-0"
                      type="button"
                      disabled={idx === 0 || isBusy}
                      onClick={() => pdf.moveFile(f.id, -1)}
                    >
                      {text.moveUp}
                    </button>
                    <button
                      className="btn text-xs px-1 py-0"
                      type="button"
                      disabled={idx === pdf.files.length - 1 || isBusy}
                      onClick={() => pdf.moveFile(f.id, 1)}
                    >
                      {text.moveDown}
                    </button>
                  </>
                )}
                <button
                  className="btn btn-danger text-xs px-2 py-0"
                  type="button"
                  disabled={isBusy}
                  onClick={() => pdf.removeFile(f.id)}
                >
                  {text.removeFile}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
