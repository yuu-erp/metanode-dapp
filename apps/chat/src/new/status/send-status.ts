import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'

export async function sendStatus({ status, ...content }: UserStatus, base: BaseConversation) {
  const account = await getCurrentAccount()
  const baseData = { status, content: JSON.stringify(content) }

  switch (base.type) {
    case 'p2p': {
      await container.userContract.setComposingStatus({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { recipient: base.id, ...baseData }
      })

      break
    }
    case 'group': {
      await container.groupContract.setComposingStatusGroup({
        from: account.hiddenAddress,
        to: base.id,
        inputData: baseData
      })
      break
    }
    case 'anonymous_group': {
      await container.anonymousGroupContract.setComposingStatusCommunity({
        from: account.hiddenAddress,
        to: base.id,
        inputData: baseData
      })
      break
    }

    default:
      throw new Error('[sendStatus] Invalid type')
  }
}
