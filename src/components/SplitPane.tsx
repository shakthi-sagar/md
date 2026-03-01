import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react'

interface SplitPaneProps {
  left: ReactNode
  right: ReactNode
}

export default function SplitPane({ left, right }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastLeftRatio = useRef(0.5)
  const [dividerState, setDividerState] = useState<'idle' | 'hover' | 'active'>('idle')

  const updatePanes = useCallback(() => {
    const container = containerRef.current
    const leftPane = leftRef.current
    const rightPane = rightRef.current
    const divider = dividerRef.current
    if (!container || !leftPane || !rightPane || !divider) return

    const totalWidth = container.getBoundingClientRect().width
    const dividerWidth = divider.offsetWidth
    const availableWidth = totalWidth - dividerWidth
    const leftWidth = availableWidth * lastLeftRatio.current
    const rightWidth = availableWidth * (1 - lastLeftRatio.current)

    leftPane.style.width = `${leftWidth}px`
    rightPane.style.width = `${rightWidth}px`
  }, [])

  useEffect(() => {
    updatePanes()

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      document.body.style.userSelect = 'none'
      const container = containerRef.current
      const divider = dividerRef.current
      const leftPane = leftRef.current
      const rightPane = rightRef.current
      if (!container || !divider || !leftPane || !rightPane) return

      const rect = container.getBoundingClientRect()
      const totalWidth = rect.width
      const offsetX = e.clientX - rect.left
      const dividerWidth = divider.offsetWidth
      const minWidth = 100
      const maxWidth = totalWidth - minWidth - dividerWidth
      const leftWidth = Math.max(minWidth, Math.min(offsetX, maxWidth))

      leftPane.style.width = `${leftWidth}px`
      rightPane.style.width = `${totalWidth - leftWidth - dividerWidth}px`
      lastLeftRatio.current = leftWidth / (totalWidth - dividerWidth)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        setDividerState('idle')
        document.body.style.cursor = 'default'
        document.body.style.userSelect = ''
      }
    }

    const handleResize = () => updatePanes()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('resize', handleResize)
    }
  }, [updatePanes])

  const handleDividerMouseDown = useCallback(() => {
    isDragging.current = true
    setDividerState('active')
    document.body.style.cursor = 'col-resize'
  }, [])

  const handleDividerDblClick = useCallback(() => {
    lastLeftRatio.current = 0.5
    updatePanes()
  }, [updatePanes])

  const dividerBg =
    dividerState === 'active' ? 'bg-gray-500' : dividerState === 'hover' ? 'bg-gray-400' : 'bg-gray-300'

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden w-full border-b border-gray-200">
      <div ref={leftRef} className="h-full overflow-hidden" style={{ width: '50%' }}>
        {left}
      </div>
      <div
        ref={dividerRef}
        className={`w-[5px] cursor-col-resize z-10 ${dividerBg} transition-colors`}
        onMouseDown={handleDividerMouseDown}
        onDoubleClick={handleDividerDblClick}
        onMouseEnter={() => {
          if (!isDragging.current) setDividerState('hover')
        }}
        onMouseLeave={() => {
          if (!isDragging.current) setDividerState('idle')
        }}
      />
      <div ref={rightRef} className="h-full overflow-hidden" style={{ width: '50%' }}>
        {right}
      </div>
    </div>
  )
}
