import { useEffect, useRef, useCallback, forwardRef } from 'react'
import { renderMarkdown } from '../utils/markdown'
import { renderMermaidBlocks, setupPanZoom } from '../utils/mermaidRenderer'

interface PreviewPaneProps {
  content: string
}

const PreviewPane = forwardRef<HTMLDivElement, PreviewPaneProps>(({ content }, ref) => {
  const outputRef = useRef<HTMLDivElement>(null)
  const mermaidTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const renderContent = useCallback(() => {
    const output = outputRef.current
    if (!output) return

    const html = renderMarkdown(content)
    output.innerHTML = html

    // Render mermaid with debounce
    if (mermaidTimeoutRef.current) clearTimeout(mermaidTimeoutRef.current)
    mermaidTimeoutRef.current = setTimeout(async () => {
      try {
        await renderMermaidBlocks(output)
        // Set up pan/zoom on each mermaid container
        const containers = output.querySelectorAll<HTMLElement>('.mermaid-container')
        containers.forEach((c) => setupPanZoom(c))
      } catch {
        // Silently ignore mermaid errors (e.g., incomplete syntax while typing)
      }
    }, 300)
  }, [content])

  useEffect(() => {
    renderContent()
  }, [renderContent])

  return (
    <div ref={ref} className="h-full overflow-y-auto whitespace-normal">
      <div className="p-2 px-4 pb-4">
        <div ref={outputRef} className="markdown-body" />
      </div>
    </div>
  )
})

PreviewPane.displayName = 'PreviewPane'

export default PreviewPane
