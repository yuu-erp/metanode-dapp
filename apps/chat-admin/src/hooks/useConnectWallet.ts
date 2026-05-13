import { Role } from '@/@types/enum'
import { methods } from '@/contract'
import { compareAddress, onError } from '@/lib'
import { useWalletStore, walletActions } from '@/modules/wallet/wallet.store'
import { flowActions } from '@/stores/flow.store'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useConnectWallet() {
  const navigate = useNavigate()
  const currentActive = useWalletStore((s) => s.currentActive)

  return useMutation({
    mutationFn: async () => {
      const [ownerAddress, isAdmin] = await Promise.all([
        methods.factory.admin({}),
        methods.factory.isAdminExecutor({
          _executor: currentActive
        })
      ])
      const isOwner = compareAddress(ownerAddress, currentActive)

      if (isOwner) {
        flowActions.setRole(Role.owner)
      } else if (isAdmin) {
        flowActions.setRole(Role.admin)
      } else {
        throw new Error('Unauthorized')
      }

      walletActions.commitCurrentToPersisted()
      navigate({ to: '/' })
    },
    onError: onError
  })
}
