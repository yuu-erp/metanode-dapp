import { container } from '@/container'
import type { Account } from '@/modules/account'
import { pollUntil } from './pure-event-setup'

export async function waitForUserContractReady(
  walletAddress: string,
  userContract: string,
  label: string,
) {
  return pollUntil(
    `${label} — user contract + publicKey`,
    async () => {
      const registered = await container.factoryContract.checkUserContract({
        from: walletAddress,
        inputData: { user: walletAddress },
      })
      if (!registered) return undefined

      const onFactory = await container.factoryContract.getUserContract({
        from: walletAddress,
        inputData: { user: walletAddress },
      })
      if (!onFactory) return undefined

      const publicKey = await container.userContract.publicKey({
        from: walletAddress,
        to: userContract,
      })
      if (!publicKey || String(publicKey).length < 16) return undefined

      return {
        registered,
        userContract: onFactory,
        publicKey: String(publicKey).slice(0, 24) + '…',
      }
    },
    { attempts: 30, delayMs: 2000 },
  )
}

export async function ensureP2pChatEnabled(account: Account) {
  await container.userContract.setP2PChatEnabled({
    from: account.address,
    to: account.contractAddress,
    // @ts-expect-error ABI dùng string boolean giống app settings
    inputData: { enabled: 'true' },
  })
}
