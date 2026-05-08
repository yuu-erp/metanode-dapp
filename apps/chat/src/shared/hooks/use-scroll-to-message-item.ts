export function useScrollToMessageItem(messageId: string, cb?: () => void) {
  return () => {
    const el = document.querySelector(`[message-id="${messageId}"]`)
    if (!el) return

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
    cb?.()
  }
}
