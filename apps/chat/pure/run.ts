import {
  mountCallCreateRoomDomain,
  mountCallLaunchParamsDomain,
  mountCallMeetingFactoryDomain,
  mountCallRejectDomain,
  mountCallRoomInfoDomain,
} from './domains/call-meeting'
import { mountConversationDomain } from './domains/conversation'
import {
  mountGroupAddMemberDomain,
  mountGroupCreateDomain,
  mountGroupInfoDomain,
  mountGroupRemoveMemberDomain,
  mountGroupTransferAdminDomain,
} from './domains/group'
import { mountMessageDomain } from './domains/message'
import {
  mountPinMessageDomain,
  mountReactMessageDomain,
  mountUnpinMessageDomain,
  mountUnreactMessageDomain,
} from './domains/message-pin-react'
import { mountSendFileMessageDomain } from './domains/send-file-message'
import { mountSendMessageDomain } from './domains/send-message'
import { mountPureE2EBanner } from './e2e/mount-pure-e2e'
import { mountWalletAccountDomain } from './domains/wallet-account'
import { renderDomainNav, renderDomainPanels } from './render-domains'
import { bootstrapFinSdk, notifyPureSdkUiState } from './sdk-loader'

function setSdkStatus(text: string) {
  const el = document.getElementById('sdk-status')
  if (el) el.textContent = text
}

const PURE_MOUNTERS: { name: string; id: number; fn: () => void }[] = [
  { name: 'wallet', id: 1, fn: mountWalletAccountDomain },
  { name: 'conversation', id: 2, fn: mountConversationDomain },
  { name: 'message', id: 3, fn: mountMessageDomain },
  { name: 'send-message', id: 4, fn: mountSendMessageDomain },
  { name: 'send-file-message', id: 5, fn: mountSendFileMessageDomain },
  { name: 'group-create', id: 6, fn: mountGroupCreateDomain },
  { name: 'group-add-member', id: 7, fn: mountGroupAddMemberDomain },
  { name: 'group-remove-member', id: 8, fn: mountGroupRemoveMemberDomain },
  { name: 'group-transfer-admin', id: 9, fn: mountGroupTransferAdminDomain },
  { name: 'group-info', id: 10, fn: mountGroupInfoDomain },
  { name: 'call-factory', id: 11, fn: mountCallMeetingFactoryDomain },
  { name: 'call-create-room', id: 12, fn: mountCallCreateRoomDomain },
  { name: 'call-room-info', id: 13, fn: mountCallRoomInfoDomain },
  { name: 'call-launch', id: 14, fn: mountCallLaunchParamsDomain },
  { name: 'call-reject', id: 15, fn: mountCallRejectDomain },
  { name: 'pin-message', id: 16, fn: mountPinMessageDomain },
  { name: 'unpin-message', id: 17, fn: mountUnpinMessageDomain },
  { name: 'react-message', id: 18, fn: mountReactMessageDomain },
  { name: 'unreact-message', id: 19, fn: mountUnreactMessageDomain },
]

function mountPureDomainPanels() {
  for (const { name, id, fn } of PURE_MOUNTERS) {
    try {
      fn()
    } catch (error) {
      console.error(`[pure] mount ${name} failed`, error)
      const host = document.querySelector(`[data-domain-body="${id}"]`)
      if (host instanceof HTMLElement) {
        host.textContent = `Mount lỗi (${name}): ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }
}

async function boot() {
  mountPureE2EBanner()
  renderDomainNav()
  renderDomainPanels()
  mountPureDomainPanels()

  setSdkStatus('Đang chạy FiaiSDK.init…')
  try {
    await bootstrapFinSdk()
    setSdkStatus('FiaiSDK sẵn sàng (window.fiaiSDK đã gán)')
    notifyPureSdkUiState()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setSdkStatus(
      `FiaiSDK lỗi: ${message} — vẫn xem form, nút bị khóa cho đến khi có window.fiaiSDK`,
    )
    console.error('[pure] sdk init failed', error)
    notifyPureSdkUiState()
  }
}

boot()
