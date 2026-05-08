import type { ConversationType } from '@/modules/conversation'
import AvatarUser from '@/shared/components/avatar-user'
import { cn } from '@/shared/lib'
import { Camera } from 'lucide-react'
import { type ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react'

export type GroupEditableAvatarProps = {
  isEdit: boolean
  name: string
  type: ConversationType
  remoteUrl?: string
  className?: string
  /** Khi user chọn ảnh mới (giữ `File` ở parent nếu cần upload sau khi bấm Done) */
  onFileChange?: (file: File) => void
}

export const GroupEditableAvatar = memo(
  ({ isEdit, name, type, remoteUrl, className, onFileChange }: GroupEditableAvatarProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const previewUrlRef = useRef<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const isGroup = type === 'group' || type === 'anonymous_group'
    const displayUrl = previewUrl ?? remoteUrl

    useEffect(() => {
      return () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
      }
    }, [])

    const handlePick = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = url
        setPreviewUrl(url)
        onFileChange?.(file)
      },
      [onFileChange]
    )

    const openPicker = useCallback(() => {
      if (!isEdit || !isGroup) return
      inputRef.current?.click()
    }, [isEdit, isGroup])

    if (!isGroup) {
      return (
        <AvatarUser
          size="2xl"
          name={name}
          className={cn('mx-auto', className)}
          type={type}
          url={remoteUrl}
        />
      )
    }

    return (
      <div
        className={cn('relative mx-auto w-fit', isEdit && 'cursor-pointer', className)}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (!isEdit) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        role={isEdit ? 'button' : undefined}
        tabIndex={isEdit ? 0 : undefined}
      >
        <AvatarUser size="2xl" name={name} type={type} url={displayUrl} />
        {isEdit && (
          <>
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-black/45 backdrop-blur-[1px]"
              aria-hidden
            />
            <Camera
              className="pointer-events-none absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePick}
            />
          </>
        )}
      </div>
    )
  }
)

GroupEditableAvatar.displayName = 'GroupEditableAvatar'
