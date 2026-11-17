import { CONTRACT_ADDRESSES } from '@/config'
import { chatContracts } from '@/container'
import { resolveUserChatContract } from '../register-chat-user-skip-delegate'
import { resolveWalletFromIdentityInput } from './wallet-identity'

export async function applyPureChatIdentity(rawInput: string) {
  chatContracts.setTo({ factory: CONTRACT_ADDRESSES.factory })

  const { kind, wallet } = await resolveWalletFromIdentityInput(rawInput)
  chatContracts.setFrom(wallet.address)

  const contract = await resolveUserChatContract(wallet, { identityKind: kind })
  chatContracts.setTo({
    factory: CONTRACT_ADDRESSES.factory,
    user: contract.contractAddress,
  })
  return { kind, wallet, contract }
}
