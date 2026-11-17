import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import type { Account } from '@/modules/account'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'

export async function ensurePureEventAbiRegistered() {
  await Promise.race([
    container.eventLogContainer.registerAbi().catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, 3000)),
  ])
}

/** Giống `EventLogProvider` + thêm contract group/room khi cần. */
export function registerPureEventTargets(account: Account, extraTargets: string[] = []) {
  const eventLog = container.eventLogContainer.eventLog
  const targets = [
    formatAddress(account.contractAddress),
    formatAddress(CONTRACT_ADDRESSES.meeting),
    formatAddress(CONTRACT_ADDRESSES.factory),
    formatAddress(CONTRACT_ADDRESSES.file),
    ...extraTargets.map((a) => formatAddress(a)),
  ]
  eventLog.registerEvent(formatAddress(account.hiddenAddress), targets)
}

export function waitForPureEvent<T extends Record<string, unknown>>(
  eventName: string,
  filter: (event: T) => boolean,
  timeoutMs = 60_000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let off: (() => void) | undefined
    const timeout = setTimeout(() => {
      off?.()
      reject(new Error(`Timeout ${timeoutMs}ms — không nhận event "${eventName}"`))
    }, timeoutMs)

    off = container.eventLogContainer.eventLog.on(eventName as never, (raw: T) => {
      try {
        if (!filter(raw)) return
        clearTimeout(timeout)
        off?.()
        resolve(raw)
      } catch (err) {
        clearTimeout(timeout)
        off?.()
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  })
}

export function waitForP2pSendEvents(options: {
  senderUserContract: string
  onSender: () => Promise<void>
  timeoutMs?: number
}) {
  const senderContract = formatAddress(options.senderUserContract)
  const sent = waitForPureEvent<{ messageId: string; sender: string }>(
    'MessageSent',
    (e) => compareAddress(e.sender, senderContract),
    options.timeoutMs,
  )
  const received = waitForPureEvent<{ messageId: string; sender: string }>(
    'MessageReceived',
    (e) => compareAddress(e.sender, senderContract),
    options.timeoutMs,
  )

  return Promise.all([options.onSender(), sent, received]).then(([, sentEv, recvEv]) => ({
    messageId: formatAddress(sentEv.messageId),
    sentEvent: sentEv,
    receivedEvent: recvEv,
  }))
}

export function waitForGroupMessageSend(options: {
  senderWallet: string
  onSend: () => Promise<void>
  timeoutMs?: number
}) {
  const sender = formatAddress(options.senderWallet)
  const evt = waitForPureEvent<{ messageId: string; sender: string; groupAddress?: string }>(
    'MessageSentGroup',
    (e) => compareAddress(e.sender, sender),
    options.timeoutMs,
  )
  return Promise.all([options.onSend(), evt]).then(([, e]) => ({
    messageId: formatAddress(e.messageId),
    event: e,
  }))
}

export async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

export async function pollUntil<T>(
  label: string,
  fn: () => Promise<T | undefined | null | false>,
  options?: { attempts?: number; delayMs?: number },
): Promise<T> {
  const attempts = options?.attempts ?? 15
  const delayMs = options?.delayMs ?? 2000
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const value = await fn()
      if (value) return value
    } catch (err) {
      lastError = err
    }
    await sleep(delayMs)
  }
  const detail = lastError instanceof Error ? lastError.message : lastError ? String(lastError) : ''
  throw new Error(`${label} — hết ${attempts} lần thử${detail ? `: ${detail}` : ''}`)
}
