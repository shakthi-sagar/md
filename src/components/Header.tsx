import { useState, useCallback } from 'react'

interface HeaderProps {
  onReset: () => void
  onCopy: () => void
  onShare: () => Promise<void>
  onDownload: () => void
  onOpenLocal: () => void
  scrollSync: boolean
  onScrollSyncChange: (enabled: boolean) => void
}

export default function Header({
  onReset,
  onCopy,
  onShare,
  onDownload,
  onOpenLocal,
  scrollSync,
  onScrollSyncChange,
}: HeaderProps) {
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [shareLabel, setShareLabel] = useState('Share')

  const handleCopy = useCallback(() => {
    onCopy()
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 1000)
  }, [onCopy])

  const handleShare = useCallback(async () => {
    await onShare()
    setShareLabel('Link Copied!')
    setTimeout(() => setShareLabel('Share'), 1500)
  }, [onShare])

  return (
    <header className="flex justify-between items-center px-4 py-2 w-full bg-[#444] text-xs text-white">
      <div className="flex items-center gap-4">
        <a href="/" className="text-white no-underline hover:underline font-bold">
          Markdown Editor
        </a>
        <a
          href="#"
          className="text-white no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault()
            onOpenLocal()
          }}
        >
          Open
        </a>
        <a
          href="#"
          className="text-white no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault()
            onDownload()
          }}
        >
          Download
        </a>
        <a
          href="#"
          className="text-white no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault()
            handleCopy()
          }}
        >
          {copyLabel}
        </a>
        <a
          href="#"
          className="text-white no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault()
            handleShare()
          }}
        >
          {shareLabel}
        </a>
        <a
          href="#"
          className="text-white no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault()
            onReset()
          }}
        >
          Reset
        </a>
        <label className="flex items-center gap-1 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={scrollSync}
            onChange={(e) => onScrollSyncChange(e.target.checked)}
            className="align-middle"
          />
          Sync scroll
        </label>
      </div>
      <div className="pr-8">
        <a href="https://github.com/shakthi-sagar/markdown-live-preview" className="block">
          <img src={`${import.meta.env.BASE_URL}image/GitHub-Mark-Light-32px.webp`} alt="GitHub" className="w-4 block" />
        </a>
      </div>
    </header>
  )
}
