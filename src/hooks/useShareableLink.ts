import { useCallback, useRef } from 'react'
import { compressContent, decompressContent } from '../utils/compression'

export function useShareableLink() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadFromUrl = useCallback(async (): Promise<string | null> => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#content=')) {
      const encoded = hash.substring(9)
      return await decompressContent(encoded)
    }
    return null
  }, [])

  const updateUrl = useCallback((content: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      const encoded = await compressContent(content)
      if (encoded) {
        const url = new URL(window.location.href)
        url.hash = `content=${encoded}`
        window.history.replaceState(null, '', url)
      }
    }, 1000)
  }, [])

  const generateLink = useCallback(async (content: string): Promise<string | null> => {
    const encoded = await compressContent(content)
    if (encoded) {
      const url = new URL(window.location.href)
      url.hash = `content=${encoded}`
      return url.toString()
    }
    return null
  }, [])

  return { loadFromUrl, updateUrl, generateLink }
}
