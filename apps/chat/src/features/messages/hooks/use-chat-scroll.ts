import * as React from 'react'
export function useChatScroll(scrollRef: React.RefObject<HTMLDivElement>) {
  const [showScrollBottom, setShowScrollBottom] = React.useState(false)
  const scrollToBottom = React.useCallback(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    // cách bottom bao xa
    const distanceFromBottom = el.scrollTop
    setShowScrollBottom(distanceFromBottom < -200)
  }, [])

  return {
    showScrollBottom,
    scrollToBottom,
    handleScroll
  }
}
