import { CONTRACT_ADDRESSES } from '@/config'
import { chatContracts } from '@/container'
import type { Account } from '@/modules/account'
import type { Wallet } from '@/modules/wallet'
import { formatAddress } from '@/shared/utils'
import type { RegisterChatUserResult } from '../register-chat-user-skip-delegate'
import { resolveUserChatContract } from '../register-chat-user-skip-delegate'
import { isPureSdkReady } from '../sdk-loader'
import {
  pureMeetingFactoryStatus,
  pureCreateMeetingRoom,
  pureMeetingRoomInfo,
  pureBuildCallLaunchParams,
  pureRejectCall,
} from '../utils/call-meeting-pure'
import { buildPureAccount } from '../utils/build-pure-account'
import { fetchConversationListFromContract } from '../utils/fetch-conversation-list'
import { fetchMessagesByConversationTarget } from '../utils/fetch-messages-by-conversation'
import {
  pureAddGroupMember,
  pureCreateGroup,
  randomPureGroupName,
} from '../utils/group-actions-pure'
import { fetchGroupSnapshot } from '../utils/fetch-group-snapshot'
import {
  purePinMessage,
  pureReactToMessage,
  pureUnpinMessage,
  pureUnreactMessage,
} from '../utils/message-pin-react-pure'
import { fetchE2eSampleFile, E2E_SAMPLE_FILE_URL } from './fetch-e2e-file'
import {
  pureSendFileWithUploadForKnownTarget,
  pureSendTextForKnownTarget,
} from '../utils/send-message-pure'
import { resolveWalletFromIdentityInput } from '../utils/wallet-identity'
import { findConversationInInbox } from '../utils/resolve-conversation-target'
import { ensureP2pChatEnabled, waitForUserContractReady } from './e2e-user-ready'
import {
  ensurePureEventAbiRegistered,
  pollUntil,
  registerPureEventTargets,
  sleep,
  waitForGroupMessageSend,
  waitForP2pSendEvents,
} from './pure-event-setup'

export type E2EStepStatus = 'pending' | 'running' | 'pass' | 'fail' | 'skip'

export type E2EStepResult = {
  id: string
  title: string
  status: E2EStepStatus
  ms?: number
  error?: string
  detail?: unknown
}

type E2EActor = {
  label: string
  wallet: Wallet
  contract: RegisterChatUserResult
  account: Account
}

type E2EContext = {
  userA?: E2EActor
  userB?: E2EActor
  p2pPeerContractForA?: string
  p2pPeerContractForB?: string
  lastP2pMessageId?: string
  groupContract?: string
  roomId?: string
}

export type E2ERunReport = {
  startedAt: string
  finishedAt: string
  pass: number
  fail: number
  skip: number
  steps: E2EStepResult[]
  context: {
    userA?: { wallet: string; userContract: string }
    userB?: { wallet: string; userContract: string }
    groupContract?: string
    roomId?: string
    lastP2pMessageId?: string
  }
}

type StepDef = {
  id: string
  title: string
  run: (ctx: E2EContext) => Promise<unknown>
  skip?: (ctx: E2EContext) => string | undefined
}

async function createActor(label: string): Promise<E2EActor> {
  chatContracts.setTo({ factory: CONTRACT_ADDRESSES.factory })
  const { wallet } = await resolveWalletFromIdentityInput('')
  chatContracts.setFrom(wallet.address)
  const contract = await resolveUserChatContract(wallet, {
    identityKind: 'random',
    displayName: label,
  })
  chatContracts.setTo({
    factory: CONTRACT_ADDRESSES.factory,
    user: contract.contractAddress,
  })
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)
  return { label, wallet, contract, account }
}

async function runSteps(
  defs: StepDef[],
  onStep: (step: E2EStepResult) => void,
): Promise<E2ERunReport> {
  const ctx: E2EContext = {}
  const steps: E2EStepResult[] = []
  const startedAt = new Date().toISOString()

  for (const def of defs) {
    const skipReason = def.skip?.(ctx)
    if (skipReason) {
      const row: E2EStepResult = {
        id: def.id,
        title: def.title,
        status: 'skip',
        detail: skipReason,
      }
      steps.push(row)
      onStep(row)
      continue
    }

    const running: E2EStepResult = { id: def.id, title: def.title, status: 'running' }
    onStep(running)

    const t0 = performance.now()
    try {
      const detail = await def.run(ctx)
      const row: E2EStepResult = {
        id: def.id,
        title: def.title,
        status: 'pass',
        ms: Math.round(performance.now() - t0),
        detail,
      }
      steps.push(row)
      onStep(row)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : undefined
      const row: E2EStepResult = {
        id: def.id,
        title: def.title,
        status: 'fail',
        ms: Math.round(performance.now() - t0),
        error: stack ?? message,
      }
      steps.push(row)
      onStep(row)
    }
  }

  const finishedAt = new Date().toISOString()
  const pass = steps.filter((s) => s.status === 'pass').length
  const fail = steps.filter((s) => s.status === 'fail').length
  const skip = steps.filter((s) => s.status === 'skip').length

  return {
    startedAt,
    finishedAt,
    pass,
    fail,
    skip,
    steps,
    context: {
      userA: ctx.userA
        ? {
            wallet: ctx.userA.wallet.address,
            userContract: ctx.userA.contract.contractAddress,
          }
        : undefined,
      userB: ctx.userB
        ? {
            wallet: ctx.userB.wallet.address,
            userContract: ctx.userB.contract.contractAddress,
          }
        : undefined,
      groupContract: ctx.groupContract,
      roomId: ctx.roomId,
      lastP2pMessageId: ctx.lastP2pMessageId,
    },
  }
}

function actorAddress(actor: E2EActor) {
  return actor.wallet.address
}

const E2E_STEPS: StepDef[] = [
  {
    id: 'sdk',
    title: 'Kiểm tra FiaiSDK / window.fiaiSDK',
    run: async () => {
      if (!isPureSdkReady()) throw new Error('Chưa có window.fiaiSDK')
      await ensurePureEventAbiRegistered()
      return { sdk: true }
    },
  },
  {
    id: 'wallet-a',
    title: 'Tạo ví A',
    run: async (ctx) => {
      ctx.userA = await createActor('PureE2E-A')
      return {
        wallet: ctx.userA.wallet.address,
        userContract: ctx.userA.contract.contractAddress,
        register: ctx.userA.contract.action,
      }
    },
  },
  {
    id: 'wallet-b',
    title: 'Tạo ví B',
    run: async (ctx) => {
      await sleep(50)
      ctx.userB = await createActor('PureE2E-B')
      return {
        wallet: ctx.userB.wallet.address,
        userContract: ctx.userB.contract.contractAddress,
        register: ctx.userB.contract.action,
      }
    },
  },
  {
    id: 'event-log-ab',
    title: 'Đăng ký event log (A + B) — user / factory / meeting / file',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      registerPureEventTargets(a.account)
      registerPureEventTargets(b.account)
      return {
        fromA: a.account.hiddenAddress,
        fromB: b.account.hiddenAddress,
      }
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví A/B' : undefined),
  },
  {
    id: 'users-ready',
    title: 'Chờ register index + publicKey on-chain; bật P2P (A & B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      const readyA = await waitForUserContractReady(
        a.wallet.address,
        a.contract.contractAddress,
        'A',
      )
      const readyB = await waitForUserContractReady(
        b.wallet.address,
        b.contract.contractAddress,
        'B',
      )
      a.account = await buildPureAccount(a.contract.walletAddress, a.contract.contractAddress)
      b.account = await buildPureAccount(b.contract.walletAddress, b.contract.contractAddress)
      await ensureP2pChatEnabled(a.account)
      await ensureP2pChatEnabled(b.account)
      return { readyA, readyB }
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'meeting-factory-a',
    title: 'Meeting factory (A) — sync nếu lệch env',
    run: async (ctx) => {
      return pureMeetingFactoryStatus(actorAddress(ctx.userA!), true)
    },
    skip: (ctx) => (!ctx.userA ? 'Chưa có ví A' : undefined),
  },
  {
    id: 'meeting-factory-b',
    title: 'Meeting factory (B) — sync nếu lệch env',
    run: async (ctx) => pureMeetingFactoryStatus(actorAddress(ctx.userB!), true),
    skip: (ctx) => (!ctx.userB ? 'Chưa có ví B' : undefined),
  },
  {
    id: 'p2p-a-to-b',
    title: 'P2P: A → B (tx + MessageSent + MessageReceived)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      ctx.p2pPeerContractForA = b.contract.contractAddress
      ctx.p2pPeerContractForB = a.contract.contractAddress

      const result = await waitForP2pSendEvents({
        senderUserContract: a.contract.contractAddress,
        onSender: () =>
          pureSendTextForKnownTarget({
            identityInput: a.wallet.address,
            conversationId: b.contract.contractAddress,
            conversationType: 'p2p',
            content: `E2E A→B ${Date.now()}`,
          }),
      })
      ctx.lastP2pMessageId = result.messageId
      return result
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'p2p-b-to-a',
    title: 'P2P: B → A (tx + events)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return waitForP2pSendEvents({
        senderUserContract: b.contract.contractAddress,
        onSender: () =>
          pureSendTextForKnownTarget({
            identityInput: b.wallet.address,
            conversationId: a.contract.contractAddress,
            conversationType: 'p2p',
            content: `E2E B→A ${Date.now()}`,
          }),
      })
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'inbox-both',
    title: 'Inbox A & B có cuộc hội thoại P2P',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      const inboxA = await pollUntil('Inbox A', async () => {
        const list = await fetchConversationListFromContract({
          walletAddress: a.contract.walletAddress,
          userContractAddress: a.contract.contractAddress,
        })
        const hit = findConversationInInbox(list, b.contract.contractAddress)
        return hit ? list.length : undefined
      })
      const inboxB = await pollUntil('Inbox B', async () => {
        const list = await fetchConversationListFromContract({
          walletAddress: b.contract.walletAddress,
          userContractAddress: b.contract.contractAddress,
        })
        const hit = findConversationInInbox(list, a.contract.contractAddress)
        return hit ? list.length : undefined
      })
      return { inboxA, inboxB }
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'message-list',
    title: 'Danh sách message P2P (A nhìn thread với B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return fetchMessagesByConversationTarget({
        walletAddress: a.contract.walletAddress,
        userContractAddress: a.contract.contractAddress,
        conversationId: b.contract.contractAddress,
        limit: 20,
      })
    },
    skip: (ctx) => (!ctx.lastP2pMessageId ? 'Chưa có messageId P2P' : undefined),
  },
  {
    id: 'p2p-file-a-to-b',
    title: 'P2P file: fetch wallet.png → upload → gửi (A→B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      const file = await fetchE2eSampleFile()
      const events = await waitForP2pSendEvents({
        senderUserContract: a.contract.contractAddress,
        onSender: () =>
          pureSendFileWithUploadForKnownTarget({
            identityInput: a.wallet.address,
            conversationId: b.contract.contractAddress,
            conversationType: 'p2p',
            file,
            caption: `E2E file ${Date.now()}`,
          }),
      })
      return {
        sourceUrl: E2E_SAMPLE_FILE_URL,
        file: { name: file.name, size: file.size, type: file.type },
        events,
      }
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'pin',
    title: 'Pin message (A)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return purePinMessage({
        identityInput: a.wallet.address,
        conversationId: b.contract.contractAddress,
        messageId: ctx.lastP2pMessageId!,
      })
    },
    skip: (ctx) => (!ctx.lastP2pMessageId ? 'Chưa có messageId' : undefined),
  },
  {
    id: 'unpin',
    title: 'Unpin message (A)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return pureUnpinMessage({
        identityInput: a.wallet.address,
        conversationId: b.contract.contractAddress,
        messageId: ctx.lastP2pMessageId!,
      })
    },
    skip: (ctx) => (!ctx.lastP2pMessageId ? 'Chưa có messageId' : undefined),
  },
  {
    id: 'react',
    title: 'React message (B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return pureReactToMessage({
        identityInput: b.wallet.address,
        conversationId: a.contract.contractAddress,
        messageId: ctx.lastP2pMessageId!,
        reaction: '👍',
      })
    },
    skip: (ctx) => (!ctx.lastP2pMessageId ? 'Chưa có messageId' : undefined),
  },
  {
    id: 'unreact',
    title: 'Unreact message (B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return pureUnreactMessage({
        identityInput: b.wallet.address,
        conversationId: a.contract.contractAddress,
        messageId: ctx.lastP2pMessageId!,
      })
    },
    skip: (ctx) => (!ctx.lastP2pMessageId ? 'Chưa có messageId' : undefined),
  },
  {
    id: 'group-create',
    title: 'Tạo group (A) — tên random + GroupCreated event',
    run: async (ctx) => {
      const a = ctx.userA!
      const groupName = randomPureGroupName('E2E')
      const created = await pureCreateGroup({
        identityInput: a.wallet.address,
        name: groupName,
      })
      ctx.groupContract = formatAddress(created.created.contractAddress)
      registerPureEventTargets(a.account, [ctx.groupContract])
      if (ctx.userB) {
        registerPureEventTargets(ctx.userB.account, [ctx.groupContract])
      }
      return {
        groupName,
        groupContract: ctx.groupContract,
        groupKey: created.groupKey,
        onChainName: created.group.name,
      }
    },
    skip: (ctx) => (!ctx.userA ? 'Chưa có ví A' : undefined),
  },
  {
    id: 'group-add-b',
    title: 'Thêm B vào group',
    run: async (ctx) => {
      const a = ctx.userA!
      return pureAddGroupMember({
        identityInput: a.wallet.address,
        groupContract: ctx.groupContract!,
        memberInput: ctx.userB!.contract.contractAddress,
      })
    },
    skip: (ctx) => (!ctx.groupContract || !ctx.userB ? 'Chưa có group / ví B' : undefined),
  },
  {
    id: 'group-msg-a',
    title: 'Group message A → chờ MessageSentGroup',
    run: async (ctx) => {
      const a = ctx.userA!
      return waitForGroupMessageSend({
        senderWallet: a.wallet.address,
        onSend: () =>
          pureSendTextForKnownTarget({
            identityInput: a.wallet.address,
            conversationId: ctx.groupContract!,
            conversationType: 'group',
            content: `E2E group A ${Date.now()}`,
          }),
      })
    },
    skip: (ctx) => (!ctx.groupContract ? 'Chưa có group' : undefined),
  },
  {
    id: 'group-msg-b',
    title: 'Group message B → chờ MessageSentGroup',
    run: async (ctx) => {
      const b = ctx.userB!
      return waitForGroupMessageSend({
        senderWallet: b.wallet.address,
        onSend: () =>
          pureSendTextForKnownTarget({
            identityInput: b.wallet.address,
            conversationId: ctx.groupContract!,
            conversationType: 'group',
            content: `E2E group B ${Date.now()}`,
          }),
      })
    },
    skip: (ctx) => (!ctx.groupContract ? 'Chưa có group' : undefined),
  },
  {
    id: 'group-info',
    title: 'Group snapshot (A)',
    run: async (ctx) => {
      const a = ctx.userA!
      return fetchGroupSnapshot(a.account, ctx.groupContract!)
    },
    skip: (ctx) => (!ctx.groupContract ? 'Chưa có group' : undefined),
  },
  {
    id: 'call-create',
    title: 'Call: createRoom → nghe RoomCreateRequested → lấy roomId',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      const rs = await pureCreateMeetingRoom({
        identityInput: a.wallet.address,
        receiver: b.wallet.address,
        roomName: `E2E-${Date.now()}`,
        isMeet: false,
      })
      ctx.roomId = rs.created.roomId
      return { roomId: ctx.roomId, snapshot: rs.snapshot }
    },
    skip: (ctx) => (!ctx.userA || !ctx.userB ? 'Chưa có ví' : undefined),
  },
  {
    id: 'call-info',
    title: 'Call: room info',
    run: async (ctx) => {
      const a = ctx.userA!
      return pureMeetingRoomInfo(a.wallet.address, ctx.roomId!)
    },
    skip: (ctx) => (!ctx.roomId ? 'Chưa có roomId' : undefined),
  },
  {
    id: 'call-launch',
    title: 'Call: build launch params',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return pureBuildCallLaunchParams({
        identityInput: a.wallet.address,
        callee: b.wallet.address,
        conversationType: 'p2p',
        roomId: ctx.roomId,
      })
    },
    skip: (ctx) => (!ctx.roomId ? 'Chưa có roomId' : undefined),
  },
  {
    id: 'call-reject',
    title: 'Call: reject (B)',
    run: async (ctx) => {
      const a = ctx.userA!
      const b = ctx.userB!
      return pureRejectCall({
        identityInput: b.wallet.address,
        roomId: ctx.roomId!,
        caller: a.wallet.address,
      })
    },
    skip: (ctx) => (!ctx.roomId ? 'Chưa có roomId' : undefined),
  },
]

export async function runPureE2EFlow(onStep: (step: E2EStepResult) => void): Promise<E2ERunReport> {
  return runSteps(E2E_STEPS, onStep)
}

export function summarizeE2EReport(report: E2ERunReport): string {
  const lines = [
    `E2E ${report.startedAt} → ${report.finishedAt}`,
    `Pass ${report.pass} | Fail ${report.fail} | Skip ${report.skip}`,
    '',
    ...report.steps.map((s) => {
      const dur = s.ms != null ? ` (${s.ms}ms)` : ''
      if (s.status === 'pass') return `✓ ${s.id}: ${s.title}${dur}`
      if (s.status === 'fail') return `✗ ${s.id}: ${s.title}${dur}\n  ${s.error ?? ''}`
      if (s.status === 'skip') return `○ ${s.id}: ${s.title} — ${s.detail ?? 'skip'}`
      return `… ${s.id}: ${s.title}`
    }),
  ]
  return lines.join('\n')
}
