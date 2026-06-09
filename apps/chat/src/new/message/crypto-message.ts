import type { Account } from '@/modules/account'
import { getCurrentAccount } from '@/shared/hooks'
import {
  decryptAesECDH,
  decryptAESGCM,
  encryptAesECDH,
  encryptAESGCM
} from '@metanodejs/system-core'

export async function decryptMessage(
  { type }: BaseConversation,
  message: string,
  key: string,
  account: Account
) {
  switch (type) {
    case 'p2p': {
      return JSON.parse((await decryptAesECDH(key, account.address, message))?.value)
    }
    case 'anonymous_group':
    case 'group': {
      return JSON.parse((await decryptAESGCM(key, message))?.resultUtf8)
    }
    default:
      throw new Error('[decryptMessage] Invalid type')
  }
}

export async function encryptMessage(input: any, key: string, base: BaseConversation) {
  input = JSON.stringify(input)

  const account = await getCurrentAccount()
  switch (base.type) {
    case 'p2p':
      return (await encryptAesECDH(key, account.address, input)).value
    case 'group':
    case 'anonymous_group':
      return (await encryptAESGCM(key, input)).result

    default:
      throw new Error('[encryptMessage]  Invalid type')
  }
}
