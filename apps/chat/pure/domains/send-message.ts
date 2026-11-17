import { bindPrimaryButton } from '../utils/bind-primary-button'
import { isPureSdkReady } from '../sdk-loader'
import { pureSendTextMessage } from '../utils/send-message-pure'
import { serializeForPureLog } from '../utils/fetch-conversation-list'

function setResult(el: HTMLElement, data: Record<string, unknown> | { error: string }) {
  el.textContent = JSON.stringify(data, null, 2)
}

export function mountSendMessageDomain() {
  const host = document.querySelector('[data-domain-body="4"]')
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Giống submit chat: payload `{ type: \"text\", content }` → encrypt (p2p ECDH / group AES-GCM) → gửi contract đúng ABI theo inbox type.'

  const identityLabel = document.createElement('label')
  identityLabel.className = 'field-label'
  identityLabel.htmlFor = 'pure-send-identity'
  identityLabel.textContent = 'Private key hoặc address'

  const identityInput = document.createElement('input')
  identityInput.type = 'password'
  identityInput.id = 'pure-send-identity'
  identityInput.className = 'field-input'
  identityInput.placeholder = '0x…'
  identityInput.autocomplete = 'off'

  const convLabel = document.createElement('label')
  convLabel.className = 'field-label'
  convLabel.htmlFor = 'pure-send-conversation-id'
  convLabel.textContent = 'conversationId (contractAddress)'

  const conversationInput = document.createElement('input')
  conversationInput.type = 'text'
  conversationInput.id = 'pure-send-conversation-id'
  conversationInput.className = 'field-input'
  conversationInput.placeholder = '0x…'
  conversationInput.autocomplete = 'off'

  const contentLabel = document.createElement('label')
  contentLabel.className = 'field-label'
  contentLabel.htmlFor = 'pure-send-content'
  contentLabel.textContent = 'Nội dung tin nhắn'

  const contentInput = document.createElement('textarea')
  contentInput.id = 'pure-send-content'
  contentInput.className = 'field-input'
  contentInput.rows = 3
  contentInput.placeholder = 'Nội dung text…'
  contentInput.autocomplete = 'off'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = 'Gửi tin nhắn (contract)'
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Chưa gửi.'

  const setBusy = (next: boolean) => {
    busy = next
    identityInput.disabled = next
    conversationInput.disabled = next
    contentInput.disabled = next
    btn.textContent = next ? 'Đang gửi…' : 'Gửi tin nhắn (contract)'
    syncButton()
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang chuẩn bị identity + encrypt…'
    try {
      if (!isPureSdkReady()) {
        throw new Error('Chưa có window.fiaiSDK')
      }
      if (!identityInput.value.trim()) throw new Error('Cần private key hoặc address')
      if (!conversationInput.value.trim()) throw new Error('Cần conversationId')
      if (!contentInput.value.trim()) throw new Error('Cần nội dung tin nhắn')

      const result = await pureSendTextMessage({
        identityInput: identityInput.value,
        conversationId: conversationInput.value.trim(),
        content: contentInput.value,
      })

      const body = serializeForPureLog({
        ok: true,
        payload: result.payload,
        conversationType: result.conversationType,
        base: result.base,
        conversationKeyPreview: result.conversationKeyPreview,
        encryptedPreview: result.encryptedPreview,
        decryptedRoundTrip: result.decryptedRoundTrip,
        txResult: result.txResult,
      }) as Record<string, unknown>
      setResult(log, body)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setResult(log, { error: message })
    } finally {
      setBusy(false)
    }
  })

  host.append(
    hint,
    identityLabel,
    identityInput,
    convLabel,
    conversationInput,
    contentLabel,
    contentInput,
    btn,
    log,
  )
}
