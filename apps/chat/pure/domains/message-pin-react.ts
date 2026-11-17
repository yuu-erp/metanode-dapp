import { serializeForPureLog } from '../utils/fetch-conversation-list'
import {
  purePinMessage,
  pureReactToMessage,
  pureUnpinMessage,
  pureUnreactMessage,
} from '../utils/message-pin-react-pure'
import { mountPureActionForm } from '../utils/mount-pure-action-form'

const logOk = (result: unknown) => serializeForPureLog({ ok: true, ...(result as object) })

const messageFields = [
  { kind: 'identity' as const },
  {
    kind: 'text' as const,
    id: 'conversationId',
    label: 'conversationId',
    placeholder: '0x…',
  },
  {
    kind: 'text' as const,
    id: 'messageId',
    label: 'messageId',
    placeholder: '0x…',
  },
]

export function mountPinMessageDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="16"]',
    hint: 'Pin tin — inbox → type → `pin-message.ts` (p2p / group / anonymous). In danh sách pinned sau.',
    buttonLabel: 'Pin message',
    fields: messageFields,
    onSubmit: async (v) => {
      if (!v.conversationId?.trim() || !v.messageId?.trim()) {
        throw new Error('Cần conversationId và messageId')
      }
      return logOk(
        await purePinMessage({
          identityInput: v.identity,
          conversationId: v.conversationId,
          messageId: v.messageId,
        }),
      )
    },
  })
}

export function mountUnpinMessageDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="17"]',
    hint: 'Unpin — cùng ABI theo type, in `pinnedMessageIds` sau.',
    buttonLabel: 'Unpin message',
    fields: messageFields,
    onSubmit: async (v) => {
      if (!v.conversationId?.trim() || !v.messageId?.trim()) {
        throw new Error('Cần conversationId và messageId')
      }
      return logOk(
        await pureUnpinMessage({
          identityInput: v.identity,
          conversationId: v.conversationId,
          messageId: v.messageId,
        }),
      )
    },
  })
}

export function mountReactMessageDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="18"]',
    hint: 'React on-chain — `encodeBase64(reaction)` như `react-message.ts`.',
    buttonLabel: 'React message',
    fields: [
      ...messageFields,
      {
        kind: 'text',
        id: 'reaction',
        label: 'Reaction (emoji / text)',
        placeholder: '👍',
      },
    ],
    onSubmit: async (v) => {
      if (!v.conversationId?.trim() || !v.messageId?.trim()) {
        throw new Error('Cần conversationId và messageId')
      }
      return logOk(
        await pureReactToMessage({
          identityInput: v.identity,
          conversationId: v.conversationId,
          messageId: v.messageId,
          reaction: v.reaction ?? '',
        }),
      )
    },
  })
}

export function mountUnreactMessageDomain() {
  mountPureActionForm({
    hostSelector: '[data-domain-body="19"]',
    hint: 'Gỡ reaction của bạn — `unReactToMessage` theo conversation type.',
    buttonLabel: 'Unreact message',
    fields: messageFields,
    onSubmit: async (v) => {
      if (!v.conversationId?.trim() || !v.messageId?.trim()) {
        throw new Error('Cần conversationId và messageId')
      }
      return logOk(
        await pureUnreactMessage({
          identityInput: v.identity,
          conversationId: v.conversationId,
          messageId: v.messageId,
        }),
      )
    },
  })
}
