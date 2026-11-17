import { bindPrimaryButton } from './bind-primary-button'
import { isPureSdkReady } from '../sdk-loader'

type FieldSpec =
  | { kind: 'identity' }
  | { kind: 'text'; id: string; label: string; placeholder?: string; password?: boolean }
  | { kind: 'textarea'; id: string; label: string; placeholder?: string; rows?: number }
  | {
      kind: 'select'
      id: string
      label: string
      options: { value: string; label: string }[]
    }
  | { kind: 'checkbox'; id: string; label: string }

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export function mountPureActionForm(options: {
  hostSelector: string
  hint: string
  buttonLabel: string
  fields: FieldSpec[]
  onSubmit: (values: Record<string, string>) => Promise<unknown>
}) {
  const host = document.querySelector(options.hostSelector)
  if (!(host instanceof HTMLElement)) return

  host.classList.remove('domain-body')
  host.classList.add('domain-body-filled')
  host.replaceChildren()

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent = options.hint

  const values: Record<string, Control> = {}
  const fragments: HTMLElement[] = [hint]

  for (const field of options.fields) {
    if (field.kind === 'identity') {
      const label = document.createElement('label')
      label.className = 'field-label'
      label.htmlFor = 'pure-identity'
      label.textContent = 'Private key hoặc address'
      const input = document.createElement('input')
      input.type = 'password'
      input.id = 'pure-identity'
      input.className = 'field-input'
      input.placeholder = '0x…'
      input.autocomplete = 'off'
      values.identity = input
      fragments.push(label, input)
      continue
    }

    if (field.kind === 'checkbox') {
      const label = document.createElement('label')
      label.className = 'field-hint'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.id = field.id
      input.dataset.pureCheckbox = field.id
      label.append(input, ` ${field.label}`)
      values[field.id] = input
      fragments.push(label)
      continue
    }

    const label = document.createElement('label')
    label.className = 'field-label'
    label.htmlFor = field.id
    label.textContent = field.label

    let control: Control
    if (field.kind === 'textarea') {
      const ta = document.createElement('textarea')
      ta.id = field.id
      ta.className = 'field-input'
      ta.rows = field.rows ?? 2
      ta.placeholder = field.placeholder ?? ''
      ta.autocomplete = 'off'
      control = ta
    } else if (field.kind === 'select') {
      const sel = document.createElement('select')
      sel.id = field.id
      sel.className = 'field-input'
      for (const opt of field.options) {
        const o = document.createElement('option')
        o.value = opt.value
        o.textContent = opt.label
        sel.append(o)
      }
      control = sel
    } else {
      const input = document.createElement('input')
      input.type = field.password ? 'password' : 'text'
      input.id = field.id
      input.className = 'field-input'
      input.placeholder = field.placeholder ?? ''
      input.autocomplete = 'off'
      control = input
    }
    values[field.id] = control
    fragments.push(label, control)
  }

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary'
  btn.textContent = options.buttonLabel
  let busy = false
  const syncButton = bindPrimaryButton(btn, () => busy)

  const log = document.createElement('pre')
  log.className = 'result-log'
  log.textContent = 'Chưa chạy.'

  const setBusy = (next: boolean) => {
    busy = next
    Object.values(values).forEach((el) => {
      el.disabled = next
    })
    btn.textContent = next ? 'Đang xử lý…' : options.buttonLabel
    syncButton()
  }

  const readPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {}
    if (values.identity) payload.identity = values.identity.value
    for (const [key, el] of Object.entries(values)) {
      if (key === 'identity') continue
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        payload[key] = el.checked ? 'true' : 'false'
      } else {
        payload[key] = el.value
      }
    }
    return payload
  }

  btn.addEventListener('click', async () => {
    setBusy(true)
    log.textContent = 'Đang gọi contract…'
    try {
      if (!isPureSdkReady()) throw new Error('Chưa có window.fiaiSDK')
      if (values.identity && !values.identity.value.trim()) {
        throw new Error('Cần private key hoặc address')
      }
      const result = await options.onSubmit(readPayload())
      log.textContent = JSON.stringify(result, null, 2)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log.textContent = JSON.stringify({ error: message }, null, 2)
    } finally {
      setBusy(false)
    }
  })

  fragments.push(btn, log)
  host.append(...fragments)
}
