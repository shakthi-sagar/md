import { useState, useEffect, useRef, useCallback } from 'react'
import type * as MonacoType from 'monaco-editor'
import Header from './components/Header'
import SplitPane from './components/SplitPane'
import EditorPane from './components/EditorPane'
import PreviewPane from './components/PreviewPane'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useShareableLink } from './hooks/useShareableLink'
import { defaultInput } from './utils/defaultTemplate'

export default function App() {
  const [content, setContent] = useState(defaultInput)
  const [scrollSync, setScrollSync] = useState(false)
  const [hasEdited, setHasEdited] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const { loadContent, saveContent, loadScrollSync, saveScrollSync } = useLocalStorage()
  const { loadFromUrl, updateUrl, generateLink } = useShareableLink()

  // Load initial content: URL > localStorage > default
  useEffect(() => {
    const init = async () => {
      const urlContent = await loadFromUrl()
      if (urlContent) {
        setContent(urlContent)
      } else {
        const saved = loadContent()
        if (saved) {
          setContent(saved)
        }
      }
      setScrollSync(loadScrollSync())
      setInitialLoaded(true)
    }
    init()
  }, [loadFromUrl, loadContent, loadScrollSync])

  // Set editor value once initial content is loaded
  useEffect(() => {
    if (initialLoaded && editorRef.current) {
      const editor = editorRef.current
      const currentValue = editor.getValue()
      if (currentValue !== content) {
        editor.setValue(content)
        editor.revealPosition({ lineNumber: 1, column: 1 })
      }
    }
  }, [initialLoaded, content])

  const handleEditorMount = useCallback((editor: MonacoType.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Set up scroll sync listener on the editor
    editor.onDidScrollChange((e) => {
      // Access scrollSync from ref to avoid stale closures
      if (!scrollSyncRef.current) return
      const preview = previewRef.current
      if (!preview) return

      const scrollTop = e.scrollTop
      const scrollHeight = e.scrollHeight
      const height = editor.getLayoutInfo().height
      const maxScrollTop = scrollHeight - height
      if (maxScrollTop <= 0) return
      const scrollRatio = scrollTop / maxScrollTop
      const targetY = (preview.scrollHeight - preview.clientHeight) * scrollRatio
      preview.scrollTo(0, targetY)
    })
  }, [])

  // Keep a ref for scrollSync to avoid stale closures in editor callback
  const scrollSyncRef = useRef(scrollSync)
  useEffect(() => {
    scrollSyncRef.current = scrollSync
  }, [scrollSync])

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value)
      setHasEdited(true)
      saveContent(value)
      updateUrl(value)
    },
    [saveContent, updateUrl],
  )

  const handleScrollSyncChange = useCallback(
    (enabled: boolean) => {
      setScrollSync(enabled)
      saveScrollSync(enabled)
    },
    [saveScrollSync],
  )

  const handleReset = useCallback(() => {
    const changed = editorRef.current?.getValue() !== defaultInput
    if (hasEdited || changed) {
      if (!window.confirm('Are you sure you want to reset? Your changes will be lost.')) {
        return
      }
    }
    setContent(defaultInput)
    setHasEdited(false)
    if (editorRef.current) {
      editorRef.current.setValue(defaultInput)
      editorRef.current.revealPosition({ lineNumber: 1, column: 1 })
      editorRef.current.focus()
    }
  }, [hasEdited])

  const handleCopy = useCallback(() => {
    const value = editorRef.current?.getValue() ?? content
    navigator.clipboard.writeText(value)
  }, [content])

  const handleShare = useCallback(async () => {
    const value = editorRef.current?.getValue() ?? content
    const longLink = await generateLink(value)
    if (!longLink) return

    let link = longLink
    try {
      const res = await fetch(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(longLink)}`,
      )
      const data = await res.json()
      if (data.shorturl) link = data.shorturl
    } catch {
      // is.gd unavailable — use long link
    }

    await navigator.clipboard.writeText(link)
  }, [content, generateLink])

  const handleDownload = useCallback(() => {
    const value = editorRef.current?.getValue() ?? content
    const blob = new Blob([value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  const handleOpenLocal = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.txt,text/markdown,text/plain'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        setHasEdited(true)
        saveContent(text)
        updateUrl(text)
        if (editorRef.current) {
          editorRef.current.setValue(text)
          editorRef.current.revealPosition({ lineNumber: 1, column: 1 })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [saveContent, updateUrl])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        onReset={handleReset}
        onCopy={handleCopy}
        onShare={handleShare}
        onDownload={handleDownload}
        onOpenLocal={handleOpenLocal}
        scrollSync={scrollSync}
        onScrollSyncChange={handleScrollSyncChange}
      />
      <SplitPane
        left={
          <EditorPane
            content={content}
            onChange={handleContentChange}
            onEditorMount={handleEditorMount}
          />
        }
        right={<PreviewPane ref={previewRef} content={content} />}
      />
    </div>
  )
}
