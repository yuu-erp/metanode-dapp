import { bindPrimaryButton } from '../utils/bind-primary-button'
import { isPureSdkReady } from '../sdk-loader'
import { applyPureChatIdentity } from '../utils/apply-pure-chat-identity'
import {
  fetchConversationListFromContract,
  serializeForPureLog,
} from '../utils/fetch-conversation-list'

function setResult(el: HTMLElement, data: Record<string, unknown> | { error: string }) {
  el.textContent = JSON.stringify(data, null, 2)
}

export function mountConversationDomain() {
  const host = document.querySelector('[data-domain-body="2"]')
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Private key hoặc address → identity + gọi user contract `getFullInboxPaginatedOptimized` (giống sync conversation trong app).'

  const label = document.createElement('label')
  label.className = 'field-label'
  label.htmlFor = 'pure-conversation-identity'
  label.textContent = 'Private key hoặc address'

  const input = document.createElement('input')
  input.type = 'password'
  input.id = 'pure-conversation-identity'
  input.className = 'field-input'
  input.placeholder = '0x…'
  input.autocomplete = 'off'
  input.required = true

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = 'Lấy danh sách conversation (contract)'
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Chưa gọi contract.'

  const setBusy = (next: boolean) => {
    busy = next
    input.disabled = next
    btn.textContent = next ? 'Đang gọi contract…' : 'Lấy danh sách conversation (contract)'
    syncButton()
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang thiết lập identity…'
    try {
      if (!isPureSdkReady()) {
        throw new Error('Chưa có window.fiaiSDK — đợi FiaiSDK.init hoàn tất')
      }
      if (!input.value.trim()) {
        throw new Error('Conversation cần private key hoặc address')
      }

      const { kind, wallet, contract } = await applyPureChatIdentity(input.value)

      log.textContent = 'Đang gọi getFullInboxPaginatedOptimized…'
      const conversations = await fetchConversationListFromContract({
        walletAddress: contract.walletAddress,
        userContractAddress: contract.contractAddress,
      })

      const list = serializeForPureLog(conversations) as unknown[]

      setResult(log, {
        ok: true,
        source: 'userContract.getFullInboxPaginatedOptimized',
        count: Array.isArray(list) ? list.length : 0,
        identityKind: kind,
        walletAddress: contract.walletAddress,
        userContractAddress: contract.contractAddress,
        userContractAction: contract.action,
        walletName: wallet.name,
        conversations: list,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setResult(log, { error: message })
    } finally {
      setBusy(false)
    }
  })

  host.append(hint, label, input, btn, log)
}
