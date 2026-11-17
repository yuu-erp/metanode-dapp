import { isPureSdkReady } from '../sdk-loader'

/** Nút domain: disabled khi chưa SDK hoặc đang busy. */
export function bindPrimaryButton(btn: HTMLButtonElement, isBusy: () => boolean) {
  const sync = () => {
    btn.disabled = isBusy() || !isPureSdkReady()
  }
  sync()
  document.addEventListener('pure:sdk-ready', sync)
  document.addEventListener('pure:sdk-failed', sync)
  return sync
}
