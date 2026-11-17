import { serializeForPureLog } from '../utils/fetch-conversation-list'
import { isPureSdkReady } from '../sdk-loader'
import { runPureE2EFlow, type E2EStepResult, type E2ERunReport } from './pure-e2e-runner'

function stepClass(status: E2EStepResult['status']) {
  switch (status) {
    case 'pass':
      return 'e2e-step e2e-step-pass'
    case 'fail':
      return 'e2e-step e2e-step-fail'
    case 'skip':
      return 'e2e-step e2e-step-skip'
    case 'running':
      return 'e2e-step e2e-step-running'
    default:
      return 'e2e-step'
  }
}

function renderSteps(host: HTMLElement, steps: E2EStepResult[]) {
  host.replaceChildren()
  for (const step of steps) {
    const row = document.createElement('div')
    row.className = stepClass(step.status)

    const head = document.createElement('div')
    head.className = 'e2e-step-head'
    const badge =
      step.status === 'pass'
        ? 'PASS'
        : step.status === 'fail'
          ? 'FAIL'
          : step.status === 'skip'
            ? 'SKIP'
            : step.status === 'running'
              ? '…'
              : '—'
    const dur = step.ms != null ? ` ${step.ms}ms` : ''
    head.textContent = `[${badge}] ${step.title}${dur}`

    row.appendChild(head)

    if (step.error) {
      const err = document.createElement('pre')
      err.className = 'e2e-step-error'
      err.textContent = step.error
      row.appendChild(err)
    } else if (step.detail && step.status === 'pass' && typeof step.detail === 'object') {
      const pre = document.createElement('pre')
      pre.className = 'e2e-step-detail'
      pre.textContent = JSON.stringify(serializeForPureLog(step.detail), null, 2).slice(0, 1200)
      row.appendChild(pre)
    }
  }
}

function formatStepLogLine(step: E2EStepResult): string | null {
  if (step.status === 'running' || step.status === 'pending') return null
  const dur = step.ms != null ? ` (${step.ms}ms)` : ''
  if (step.status === 'pass') return `✓ ${step.id}: ${step.title}${dur}`
  if (step.status === 'fail') return `✗ ${step.id}: ${step.title}${dur}\n  ${step.error ?? ''}`
  if (step.status === 'skip') {
    const reason = typeof step.detail === 'string' ? step.detail : (step.detail ?? 'skip')
    return `○ ${step.id}: ${step.title} — ${reason}`
  }
  return null
}

function setSummaryIdle(el: HTMLElement) {
  el.textContent = 'Chưa chạy — nhấn nút để tạo context và test lần lượt các domain.'
}

function setSummaryRunning(el: HTMLElement, steps: E2EStepResult[]) {
  const pass = steps.filter((s) => s.status === 'pass').length
  const fail = steps.filter((s) => s.status === 'fail').length
  const skip = steps.filter((s) => s.status === 'skip').length
  const current = steps.find((s) => s.status === 'running')
  const tail = current ? ` · đang: ${current.title}` : ''
  el.textContent = `Đang chạy… ${pass} pass · ${fail} fail · ${skip} skip${tail}`
}

function setSummaryDone(el: HTMLElement, report: E2ERunReport) {
  el.textContent = `Xong: ${report.pass} pass · ${report.fail} fail · ${report.skip} skip · ${report.finishedAt}`
}

function appendToStreamLog(log: HTMLElement, chunk: string) {
  if (!chunk) return
  if (log.textContent && !log.textContent.endsWith('\n')) {
    log.textContent += '\n'
  }
  log.textContent += chunk
  log.scrollTop = log.scrollHeight
}

export function mountPureE2EBanner() {
  const mount = document.getElementById('pure-e2e-banner')
  if (!mount) return

  mount.classList.add('e2e-banner')

  const summary = document.createElement('p')
  summary.className = 'e2e-summary'
  setSummaryIdle(summary)

  const hint = document.createElement('p')
  hint.className = 'field-hint'
  hint.textContent =
    'Tự tạo 2 ví mới, register chat, đăng ký event (kèm group khi tạo), P2P↔ + file (wallet.png), pin/react, group, call. Fail ghi stack; không nghe event → timeout.'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'btn-primary e2e-run-btn'
  btn.textContent = 'Chạy full E2E (19 domain)'

  const stepsHost = document.createElement('div')
  stepsHost.className = 'e2e-steps'
  stepsHost.setAttribute('aria-live', 'polite')

  const log = document.createElement('pre')
  log.className = 'result-log e2e-full-log'
  log.textContent = 'Log stream — mỗi bước ghi ngay khi xong.'

  let running = false
  const stepBuffer: E2EStepResult[] = []

  const syncButtons = () => {
    btn.disabled = running || !isPureSdkReady()
    if (!isPureSdkReady()) {
      btn.title = 'Đợi FiaiSDK.init'
    } else {
      btn.title = ''
    }
  }

  document.addEventListener('pure:sdk-ready', syncButtons)
  document.addEventListener('pure:sdk-failed', syncButtons)
  syncButtons()

  btn.addEventListener('click', async () => {
    if (running) return
    running = true
    stepBuffer.length = 0
    stepsHost.replaceChildren()
    setSummaryRunning(summary, stepBuffer)
    const startedAt = new Date().toISOString()
    log.textContent = `E2E bắt đầu ${startedAt}\n`
    syncButtons()

    try {
      const report = await runPureE2EFlow((step) => {
        const idx = stepBuffer.findIndex((s) => s.id === step.id)
        if (idx >= 0) stepBuffer[idx] = step
        else stepBuffer.push(step)

        renderSteps(stepsHost, [...stepBuffer])
        const lastRow = stepsHost.lastElementChild
        if (lastRow) lastRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        setSummaryRunning(summary, stepBuffer)

        const line = formatStepLogLine(step)
        if (line) {
          appendToStreamLog(log, line)
          console.log('[pure-e2e]', line)
        }
      })

      setSummaryDone(summary, report)
      appendToStreamLog(
        log,
        `\n--- xong ${report.finishedAt} ---\nPass ${report.pass} | Fail ${report.fail} | Skip ${report.skip}\n\n--- context ---\n${JSON.stringify(serializeForPureLog(report.context), null, 2)}`,
      )
    } catch (error) {
      const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
      setSummaryIdle(summary)
      appendToStreamLog(log, `\nRunner crash:\n${message}`)
    } finally {
      running = false
      syncButtons()
    }
  })

  mount.append(summary, hint, btn, stepsHost, log)
}
