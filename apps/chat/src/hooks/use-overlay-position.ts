import React from 'react'

type Params = {
  x?: number
  y?: number
  gap?: number
  padding?: number
}

export function useOverlayPosition({ x, y, gap = 12, padding = 16 }: Params) {
  const contentRef = React.useRef<HTMLDivElement>(null)

  const [position, setPosition] = React.useState({
    left: -9999,
    top: -9999
  })

  const updatePosition = React.useCallback(() => {
    if (!contentRef.current || x == null || y == null) return

    const vw = window.innerWidth
    const vh = window.innerHeight

    const width = contentRef.current.offsetWidth
    const height = contentRef.current.offsetHeight

    const canRight = x + gap + width <= vw - padding
    const canLeft = x - gap - width >= padding

    const canBottom = y + gap + height <= vh - padding
    const canTop = y - gap - height >= padding

    let left = x + gap
    let top = y + gap

    // Ưu tiên: bottom-right
    if (canRight && canBottom) {
      left = x + gap
      top = y + gap
    }
    // top-right
    else if (canRight && canTop) {
      left = x + gap
      top = y - height - gap
    }
    // bottom-left
    else if (canLeft && canBottom) {
      left = x - width - gap
      top = y + gap
    }
    // top-left
    else {
      left = x - width - gap
      top = y - height - gap
    }

    left = Math.max(padding, Math.min(left, vw - width - padding))

    top = Math.max(padding, Math.min(top, vh - height - padding))

    setPosition({ left, top })
  }, [x, y, gap, padding])

  React.useLayoutEffect(() => {
    updatePosition()
  }, [updatePosition])

  React.useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const ro = new ResizeObserver(updatePosition)

    ro.observe(el)

    window.addEventListener('resize', updatePosition)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updatePosition)
    }
  }, [updatePosition])

  return {
    contentRef,
    position
  }
}
