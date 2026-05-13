import { copyClipboard, getFromClipboard } from '@metanodejs/system-core'
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

export async function paste() {
  if (window?.finSdk) {
    return await navigator.clipboard.readText()
  } else {
    return (await getFromClipboard()).value
  }
}

export function normalizeAddress(address: string) {
  return String(address || '')
    .trim()
    .toLowerCase()
    .replace(/^0x/, '')
}

export function compareAddress(add1: string, add2: string) {
  return normalizeAddress(add1) === normalizeAddress(add2)
}
