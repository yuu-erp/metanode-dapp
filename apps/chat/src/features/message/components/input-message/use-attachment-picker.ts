'use client'
import { useFilePicker } from '@/shared/hooks'

export function useAttachmentPicker() {
  const { open, FileInput } = useFilePicker({
    accept: 'image/*,video/*,application/pdf',
    multiple: true,
    onSelect: (files) => {
      console.log('Selected files:', files)
      // TODO: upload / preview
    }
  })

  return {
    openFilePicker: open,
    FileInput
  }
}
