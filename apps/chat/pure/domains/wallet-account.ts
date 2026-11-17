import { bindPrimaryButton } from '../utils/bind-primary-button'
import { isPureSdkReady } from '../sdk-loader'
import { applyPureChatIdentity } from '../utils/apply-pure-chat-identity'

function setResult(el: HTMLElement, data: Record<string, unknown> | { error: string }) {
  el.textContent = JSON.stringify(data, null, 2)
}

export function mountWalletAccountDomain() {
  const host = document.querySelector('[data-domain-body="1"]')
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Private key, địa chỉ ví, hoặc để trống → ví mới. Đã đăng ký chat → chỉ tra user contract; chưa → đăng ký (không delegate).'

  const label = document.createElement('label')
  label.className = 'field-label'
  label.htmlFor = 'pure-wallet-identity'
  label.textContent = 'Private key hoặc address (tuỳ chọn)'

  const input = document.createElement('input')
  input.type = 'password'
  input.id = 'pure-wallet-identity'
  input.className = 'field-input'
  input.placeholder = '0x… private key / address, hoặc trống'
  input.autocomplete = 'off'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = 'Thiết lập ví & user contract'
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Kết quả sẽ hiển thị tại đây.'

  const setBusy = (next: boolean) => {
    busy = next
    input.disabled = next
    btn.textContent = next ? 'Đang xử lý…' : 'Thiết lập ví & user contract'
    syncButton()
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang resolve ví…'
    try {
      if (!isPureSdkReady()) {
        throw new Error('Chưa có window.fiaiSDK — đợi FiaiSDK.init hoàn tất')
      }

      const { kind, wallet, contract } = await applyPureChatIdentity(input.value)

      setResult(log, {
        ok: true,
        identityKind: kind,
        walletAddress: contract.walletAddress,
        contractAddress: contract.contractAddress,
        alreadyRegistered: contract.alreadyRegistered,
        action: contract.action,
        walletName: wallet.name,
        note: 'Delegate flow skipped (pure test)',
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
