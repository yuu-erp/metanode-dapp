import { blockchain } from '~/clients'
import { roomStore } from '~/stores'
import { encodeBase64 } from '~/utils'

export async function sendReaction(reaction: string) {
  const { roomId, address } = roomStore.getState()
  const _reaction = encodeBase64(reaction)

  await blockchain.sendCallReaction({
    roomId,
    _reaction,
    owner: address
  })
}
