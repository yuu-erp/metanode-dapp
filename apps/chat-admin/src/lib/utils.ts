import { copyClipboard } from '@metanodejs/system-core'
import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copy(value: string) {
  if (window.finSdk) {
    await navigator.clipboard.writeText(value)
  } else {
    await copyClipboard(value)
  }
  toast.success('Copy success')
}
