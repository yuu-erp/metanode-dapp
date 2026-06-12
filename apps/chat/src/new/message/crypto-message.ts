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
  console.log('decryptMessage', { message })
  switch (type) {
    case 'p2p': {
      let rs = await decryptAesECDH(key, account.address, message)
      rs = rs?.value ?? rs
      return typeof rs === 'object' ? rs : JSON.parse(rs)
    }
    case 'anonymous_group':
    case 'group': {
      let rs = await decryptAESGCM(key, message)
      rs = rs?.resultUtf8 ?? rs
      return typeof rs === 'object' ? rs : JSON.parse(rs)
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
