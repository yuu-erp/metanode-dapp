import { compareAddress } from '@/shared/lib'
import { useEventLog } from '../use-event-log'
import { useAddress } from './use-address'
import { useNavigate } from '@tanstack/react-router'
import { container } from '@/container'
import { toast } from 'sonner'

export function useDisabled() {
  const { address } = useAddress()
  const navigate = useNavigate()

  useEventLog('UserDisabled', (event) => {
    console.log(event)
    if (compareAddress(address, event.user)) {
      container.accountService.logout()
      toast.error('User is disabled')
      navigate({ to: '/wallets' })
    }
  })
}
