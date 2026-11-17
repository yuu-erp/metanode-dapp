import type { Account } from '@/modules/account'
import {
  decryptAesECDH,
  decryptAESGCM,
  encryptAesECDH,
  encryptAESGCM,
} from '@metanodejs/system-core'

/** `crypto-message.ts` với account truyền vào (pure không dùng getCurrentAccount). */
export async function encryptMessageForAccount(
  input: Record<string, unknown>,
  key: string,
  base: BaseConversation,
  account: Account,
): Promise<string> {
  const payload = JSON.stringify(input)
  switch (base.type) {
    case 'p2p':
      return (await encryptAesECDH(key, account.address, payload)).value
    case 'group':
    case 'anonymous_group':
      return (await encryptAESGCM(key, payload)).result
    default:
      throw new Error(`[pure] encrypt không hỗ trợ type: ${base.type}`)
  }
}

export async function decryptMessageForAccount(
  base: BaseConversation,
  message: string,
  key: string,
  account: Account,
): Promise<unknown> {
  switch (base.type) {
    case 'p2p': {
      let rs = await decryptAesECDH(key, account.address, message)
      rs = rs?.value ?? rs
      return typeof rs === 'object' ? rs : JSON.parse(String(rs))
    }
    case 'anonymous_group':
    case 'group': {
      let rs = await decryptAESGCM(key, message)
      rs = rs?.resultUtf8 ?? rs
      return typeof rs === 'object' ? rs : JSON.parse(String(rs))
    }
    default:
      throw new Error(`[pure] decrypt không hỗ trợ type: ${base.type}`)
  }
}
