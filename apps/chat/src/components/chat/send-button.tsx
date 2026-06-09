import { useSubmitChatInput } from '@/new/message/submit-chat-input'
import { useFileStore } from '@/stores/file.store'
import { useInputStore } from '@/stores/input.store'
import { Send } from 'lucide-react'
import { memo } from 'react'

export type SendButtonProps = {}

export const SendButton = memo(({}: SendButtonProps) => {
  const value = useInputStore((s) => s.chatValue)
  const fileItems = useFileStore((s) => s.items)
  const { submit } = useSubmitChatInput()

  if (!value.trim() && fileItems.length === 0) return null
  return (
    <button
      onClick={submit}
      className="h-10 w-12 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform duration-150 active:scale-80"
    >
      <Send className="text-white size-5" />
    </button>
  )
})
