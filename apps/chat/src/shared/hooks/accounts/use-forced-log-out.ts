import { container } from '@/container'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useForcedLogout() {
  const navigate = useNavigate()

  useEffect(() => {
    const cb = () => {
      navigate({ to: '/wallets' })
    }
    container.eventBus.on('account.logout', cb)
    return () => container.eventBus.off('account.logout', cb)
  }, [])
}
