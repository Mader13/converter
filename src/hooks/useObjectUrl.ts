import { useEffect, useMemo } from 'react'

export function useObjectUrl(blob: Blob | null): string | null {
  const objectUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])

  useEffect(() => {
    if (!objectUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return objectUrl
}
