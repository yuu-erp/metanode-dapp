'use client'
import { useFilePicker } from '@/shared/hooks'

export interface UseAttachmentPickerOptions {
  onSelect?: (files: File[]) => void
}

export function useAttachmentPicker(options?: UseAttachmentPickerOptions) {
  const { open, FileInput } = useFilePicker({
    accept: 'image/*,video/*,application/pdf,*/*',
    multiple: true,
    onSelect: (files) => {
      options?.onSelect?.(files)
    }
  })

  return {
    openFilePicker: open,
    FileInput
  }
}
