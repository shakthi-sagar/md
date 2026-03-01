import { useCallback } from 'react'
import Storehouse from 'storehouse-js'

const NAMESPACE = 'com.markdownlivepreview'
const CONTENT_KEY = 'last_state'
const SCROLL_SYNC_KEY = 'scroll_bar_settings'

const FAR_FUTURE = new Date(2099, 1, 1)

export function useLocalStorage() {
  const loadContent = useCallback((): string | null => {
    return Storehouse.getItem(NAMESPACE, CONTENT_KEY)
  }, [])

  const saveContent = useCallback((content: string) => {
    Storehouse.setItem(NAMESPACE, CONTENT_KEY, content, FAR_FUTURE)
  }, [])

  const loadScrollSync = useCallback((): boolean => {
    const val = Storehouse.getItem(NAMESPACE, SCROLL_SYNC_KEY)
    return val === 'true' || val === true as unknown as string
  }, [])

  const saveScrollSync = useCallback((enabled: boolean) => {
    Storehouse.setItem(NAMESPACE, SCROLL_SYNC_KEY, enabled, FAR_FUTURE)
  }, [])

  return { loadContent, saveContent, loadScrollSync, saveScrollSync }
}
