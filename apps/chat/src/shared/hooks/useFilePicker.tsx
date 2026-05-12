'use client'
import * as React from 'react'

interface UseFilePickerOptions {
  accept?: string
  multiple?: boolean
  onSelect?: (files: File[]) => void
}

export function useFilePicker(options?: UseFilePickerOptions) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const open = React.useCallback(() => {
    console.log('thanhduy - open input')
    inputRef.current?.click()
  }, [])

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (!files.length) return

      options?.onSelect?.(files)

      // reset để có thể chọn lại cùng 1 file
      e.target.value = ''
    },
    [options]
  )

  const FileInput = (
    <input
      ref={inputRef}
      type="file"
      hidden
      accept={options?.accept}
      multiple={options?.multiple}
      onChange={onChange}
    />
  )

  return {
    open,
    FileInput
  }
}
