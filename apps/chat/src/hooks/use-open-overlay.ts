import { modalActions } from '@/stores/modal.store'
import { usePlatform } from './core/use-platform'

export function useOpenOverlay(options: any = {}) {
  const { isMobile } = usePlatform()
  function openModal(e: any) {
    e.preventDefault()
    e.stopPropagation()
    const event = e?.changedTouches ?? e
    modalActions.setOpen('overlay', { x: event.clientX, y: event.clientY, ...options })
  }
  const behavior = isMobile ? { onClick: openModal } : { onContextMenu: openModal }
  return { behavior }
}
