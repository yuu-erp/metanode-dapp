import { bindPrimaryButton } from '../utils/bind-primary-button'
import { isPureSdkReady } from '../sdk-loader'
import { applyPureChatIdentity } from '../utils/apply-pure-chat-identity'
import { fetchMessagesByConversationTarget } from '../utils/fetch-messages-by-conversation'
import { serializeForPureLog } from '../utils/fetch-conversation-list'

function setResult(el: HTMLElement, data: Record<string, unknown> | { error: string }) {
  el.textContent = JSON.stringify(data, null, 2)
}

export function mountMessageDomain() {
  const host = document.querySelector('[data-domain-body="3"]')
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Identity + conversationId (contract từ list). Tự gọi inbox → suy type (p2p / group / anonymous_group) → đúng ABI như list-mesage.ts.'

  const identityLabel = document.createElement('label')
  identityLabel.className = 'field-label'
  identityLabel.htmlFor = 'pure-message-identity'
  identityLabel.textContent = 'Private key hoặc address'

  const identityInput = document.createElement('input')
  identityInput.type = 'password'
  identityInput.id = 'pure-message-identity'
  identityInput.className = 'field-input'
  identityInput.placeholder = '0x…'
  identityInput.autocomplete = 'off'

  const convLabel = document.createElement('label')
  convLabel.className = 'field-label'
  convLabel.htmlFor = 'pure-message-conversation-id'
  convLabel.textContent = 'conversationId (contractAddress từ list)'

  const conversationInput = document.createElement('input')
  conversationInput.type = 'text'
  conversationInput.id = 'pure-message-conversation-id'
  conversationInput.className = 'field-input'
  conversationInput.placeholder = '0x… user / group / anonymous group contract'
  conversationInput.autocomplete = 'off'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = 'Lấy danh sách message (contract)'
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Chưa gọi contract.'

  const setBusy = (next: boolean) => {
    busy = next
    identityInput.disabled = next
    conversationInput.disabled = next
    btn.textContent = next ? 'Đang gọi contract…' : 'Lấy danh sách message (contract)'
    syncButton()
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang thiết lập identity…'
    try {
      if (!isPureSdkReady()) {
        throw new Error('Chưa có window.fiaiSDK — đợi FiaiSDK.init hoàn tất')
      }
      if (!identityInput.value.trim()) {
        throw new Error('Cần private key hoặc address')
      }
      const conversationId = conversationInput.value.trim()
      if (!conversationId) {
        throw new Error('Cần conversationId (contractAddress)')
      }

      const { contract } = await applyPureChatIdentity(identityInput.value)

      log.textContent = 'Đang lấy inbox + messages…'
      const result = await fetchMessagesByConversationTarget({
        walletAddress: contract.walletAddress,
        userContractAddress: contract.contractAddress,
        conversationId,
      })

      const messages = serializeForPureLog(result.messages) as unknown[]
      const inboxItem = serializeForPureLog(result.inboxItem)

      setResult(log, {
        ok: true,
        conversationType: result.conversationType,
        contractMethod: result.contractMethod,
        conversationId: result.inboxItem.conversationId,
        count: Array.isArray(messages) ? messages.length : 0,
        walletAddress: contract.walletAddress,
        userContractAddress: contract.contractAddress,
        inboxItem,
        messages,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setResult(log, { error: message })
    } finally {
      setBusy(false)
    }
  })

  host.append(hint, identityLabel, identityInput, convLabel, conversationInput, btn, log)
}
