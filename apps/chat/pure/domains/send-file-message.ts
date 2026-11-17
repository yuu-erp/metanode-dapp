import { bindPrimaryButton } from '../utils/bind-primary-button'
import { serializeForPureLog } from '../utils/fetch-conversation-list'
import { pureSendFileWithUpload } from '../utils/send-message-pure'
import { isPureSdkReady } from '../sdk-loader'

function setResult(el: HTMLElement, data: Record<string, unknown> | { error: string }) {
  el.textContent = JSON.stringify(data, null, 2)
}

export function mountSendFileMessageDomain() {
  const host = document.querySelector('[data-domain-body="5"]')
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Chọn file → upload (`prepareFilesForSend` / file-module) lấy fileKey → encrypt payload file → gửi contract.'

  const identityLabel = document.createElement('label')
  identityLabel.className = 'field-label'
  identityLabel.htmlFor = 'pure-send-file-identity'
  identityLabel.textContent = 'Private key hoặc address'

  const identityInput = document.createElement('input')
  identityInput.type = 'password'
  identityInput.id = 'pure-send-file-identity'
  identityInput.className = 'field-input'
  identityInput.placeholder = '0x…'
  identityInput.autocomplete = 'off'

  const convLabel = document.createElement('label')
  convLabel.className = 'field-label'
  convLabel.htmlFor = 'pure-send-file-conversation-id'
  convLabel.textContent = 'conversationId (contractAddress)'

  const conversationInput = document.createElement('input')
  conversationInput.type = 'text'
  conversationInput.id = 'pure-send-file-conversation-id'
  conversationInput.className = 'field-input'
  conversationInput.placeholder = '0x…'
  conversationInput.autocomplete = 'off'

  const fileLabel = document.createElement('label')
  fileLabel.className = 'field-label'
  fileLabel.htmlFor = 'pure-send-file-picker'
  fileLabel.textContent = 'File'

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.id = 'pure-send-file-picker'
  fileInput.className = 'field-input'
  fileInput.autocomplete = 'off'

  const captionLabel = document.createElement('label')
  captionLabel.className = 'field-label'
  captionLabel.htmlFor = 'pure-send-file-caption'
  captionLabel.textContent = 'Caption (tuỳ chọn)'

  const captionInput = document.createElement('textarea')
  captionInput.id = 'pure-send-file-caption'
  captionInput.className = 'field-input'
  captionInput.rows = 2
  captionInput.placeholder = 'Chú thích kèm file…'
  captionInput.autocomplete = 'off'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = 'Upload & gửi file message'
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Chưa gửi.'

  const setBusy = (next: boolean) => {
    busy = next
    identityInput.disabled = next
    conversationInput.disabled = next
    fileInput.disabled = next
    captionInput.disabled = next
    btn.textContent = next ? 'Đang upload & gửi…' : 'Upload & gửi file message'
    syncButton()
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang upload file…'
    try {
      if (!isPureSdkReady()) throw new Error('Chưa có window.fiaiSDK')
      if (!identityInput.value.trim()) throw new Error('Cần private key hoặc address')
      if (!conversationInput.value.trim()) throw new Error('Cần conversationId')
      const file = fileInput.files?.[0]
      if (!file) throw new Error('Chọn file')

      const result = await pureSendFileWithUpload({
        identityInput: identityInput.value,
        conversationId: conversationInput.value.trim(),
        file,
        caption: captionInput.value,
      })

      const body = serializeForPureLog({
        ok: true,
        upload: result.upload,
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
    fileLabel,
    fileInput,
    captionLabel,
    captionInput,
    btn,
    log,
  )
}
