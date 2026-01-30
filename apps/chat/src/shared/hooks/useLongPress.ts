import { useCallback, useRef, useState } from 'react'

interface UseLongPressOptions {
  threshold?: number // ms
  shouldPreventDefault?: boolean
  movementThreshold?: number // pixel để phân biệt tap vs scroll/swipe
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void
  onLongPressStart?: (e: React.MouseEvent | React.TouchEvent) => void
  onLongPressEnd?: (e: React.MouseEvent | React.TouchEvent) => void
}

type LongPressEvent = React.MouseEvent | React.TouchEvent

export function useLongPress({
  threshold = 500,
  shouldPreventDefault = true,
  movementThreshold = 10, // 8-15px thường tốt nhất cho UX mobile
  onClick,
  onLongPressStart,
  onLongPressEnd
}: UseLongPressOptions = {}) {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const targetRef = useRef<EventTarget | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const getPosition = useCallback((e: LongPressEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    if ('clientX' in e) {
      return { x: e.clientX, y: e.clientY }
    }
    return null
  }, [])

  const start = useCallback(
    (e: LongPressEvent) => {
      targetRef.current = e.currentTarget
      startPos.current = getPosition(e)

      // Chỉ prevent touchstart để tránh scroll ngay từ đầu
      if (shouldPreventDefault && e.type === 'touchstart') {
        e.preventDefault()
      }

      if (longPressTriggered) return

      timeoutRef.current = setTimeout(() => {
        setLongPressTriggered(true)
        onLongPressStart?.(e)
      }, threshold)
    },
    [threshold, shouldPreventDefault, onLongPressStart, longPressTriggered, getPosition]
  )

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPos.current) return

      const currentPos = getPosition(e as LongPressEvent)
      if (!currentPos) return

      const dx = Math.abs(currentPos.x - startPos.current.x)
      const dy = Math.abs(currentPos.y - startPos.current.y)

      if (dx > movementThreshold || dy > movementThreshold) {
        cancel()
        setLongPressTriggered(false)
        startPos.current = null // reset
      }
    },
    [cancel, movementThreshold, getPosition]
  )

  const end = useCallback(
    (e: LongPressEvent) => {
      // Chỉ preventDefault khi đã long press (không ngăn tap nhanh)
      if (shouldPreventDefault && longPressTriggered) {
        e.preventDefault()
      }

      cancel()

      const currentPos = getPosition(e)
      let isSmallMovement = true

      if (startPos.current && currentPos) {
        const dx = Math.abs(currentPos.x - startPos.current.x)
        const dy = Math.abs(currentPos.y - startPos.current.y)
        isSmallMovement = dx <= movementThreshold && dy <= movementThreshold
      }

      // Gọi onClick chỉ khi tap nhanh + di chuyển nhỏ + target khớp
      if (!longPressTriggered && isSmallMovement && targetRef.current === e.currentTarget) {
        onClick?.(e)
      }

      // Long press end
      if (longPressTriggered) {
        onLongPressEnd?.(e)
        setLongPressTriggered(false)
      }

      startPos.current = null
    },
    [
      cancel,
      longPressTriggered,
      onClick,
      onLongPressEnd,
      shouldPreventDefault,
      movementThreshold,
      getPosition
    ]
  )

  const handlers = {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: end,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: cancel,
    onTouchMove: move,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault()
  }

  return {
    handlers,
    isLongPressActive: longPressTriggered
  }
}
