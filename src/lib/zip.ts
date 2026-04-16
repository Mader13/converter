import { zip } from 'fflate'

export interface ZipEntry {
  blob: Blob
  fileName: string
}

export async function buildZipBlob(entries: ZipEntry[]): Promise<Blob> {
  const archiveInput: Record<string, Uint8Array> = {}

  for (const entry of entries) {
    archiveInput[entry.fileName] = new Uint8Array(await entry.blob.arrayBuffer())
  }

  return new Promise((resolve, reject) => {
    zip(archiveInput, { level: 6 }, (error, data) => {
      if (error) {
        reject(error)
        return
      }

      const buffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer

      resolve(new Blob([buffer], { type: 'application/zip' }))
    })
  })
}
