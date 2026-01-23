import type { MessageType } from '@/modules/message'
import { useGetUserProfile } from '@/shared/hooks/accounts'

export function useReplyMeta(sender: string, type: MessageType, text?: string) {
  const { data: profile, isLoading, isError } = useGetUserProfile(sender)

  let title = 'Reply'
  if (isLoading) title = 'Đang tải...'
  else if (isError) title = 'Người dùng'
  else if (profile) title = [profile.firstName, profile.lastName].filter(Boolean).join(' ')

  let content = '[Tin nhắn không hỗ trợ]'
  if (type === 'text' && text) {
    content = text
  }

  return { title, content }
}
