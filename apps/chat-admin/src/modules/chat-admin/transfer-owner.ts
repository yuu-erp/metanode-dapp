import { methods } from '@/contract'
import { onError } from '@/lib'
import { flowActions } from '@/stores/flow.store'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { walletActions } from '../wallet/wallet.store'

export function useTransferOwner(address: string) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      await methods.factory.changeAdmin({
        newAdmin: address
      })
    },
    onSuccess: () => {
      walletActions.reset()
      flowActions.setRole(null)
      navigate({ to: '/set-wallet' })
    },
    onError: onError
  })
}
