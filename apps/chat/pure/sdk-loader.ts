/**
 * Khởi tạo Fin/Fiai — `window.fiaiSDK` chỉ có sau `FiaiSDK.init()` (@metanodejs/fiai-sdk).
 * Khớp `finsk.context-2.tsx` + `initFileReact`.
 */

import { FiaiSDK } from '@metanodejs/fiai-sdk'
import { QueryClient } from '@tanstack/react-query'

function isNativeShell() {
  const w = window as typeof window & {
    webkit?: { messageHandlers?: { callbackHandler?: { postMessage?: unknown } } }
    electronAPI?: { sendMessage?: unknown }
  }
  return !!w.webkit?.messageHandlers?.callbackHandler?.postMessage || !!w.electronAPI?.sendMessage
}

function initFileReactBridge() {
  const initFileReact = (window as Window & { initFileReact?: (opts: unknown) => void })
    .initFileReact
  if (typeof initFileReact !== 'function') {
    console.warn('[pure] initFileReact không có trên window — bỏ qua')
    return
  }
  const queryClient = new QueryClient()
  initFileReact({ client: queryClient })
}

/** Bắt buộc trước createWallet / contract (web). */
export async function bootstrapFinSdk(): Promise<void> {
  const native = isNativeShell()

  // Trang pure dev-only: web luôn cần init để gán window.fiaiSDK.
  if (!native) {
    await FiaiSDK.init({})
  }

  if (!window.fiaiSDK && !native) {
    throw new Error('FiaiSDK.init xong nhưng window.fiaiSDK vẫn chưa có')
  }

  initFileReactBridge()
}

export function isPureSdkReady(): boolean {
  return isNativeShell() || !!window.fiaiSDK
}

export function notifyPureSdkUiState() {
  const name = isPureSdkReady() ? 'pure:sdk-ready' : 'pure:sdk-failed'
  document.dispatchEvent(new CustomEvent(name))
}
