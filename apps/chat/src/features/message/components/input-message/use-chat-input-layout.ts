'use client'
import * as React from 'react'

export function useChatInputLayout(message: string) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // auto resize textarea
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [message])

  // update --chat-input-height
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateHeight = () => {
      document.documentElement.style.setProperty('--chat-input-height', `${el.offsetHeight}px`)
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return {
    textareaRef,
    containerRef
  }
}
