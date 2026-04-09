import { copyClipboard } from '@metanodejs/system-core'
import { toast } from 'sonner'

export function useCopy(value: string) {
  return async () => {
    if (window.finSdk) {
      await navigator.clipboard.writeText(value)
    } else {
      await copyClipboard(value)
    }
    toast.success('Copy success')
  }
}
