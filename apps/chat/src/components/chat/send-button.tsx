import { useSubmitChatInput } from '@/new/message/submit-chat-input'
import { useInputStore } from '@/stores/input.store'
import { useSelectedId } from 'file-core'
import { Send } from 'lucide-react'
import { memo } from 'react'

export type SendButtonProps = {
  reforcus: () => void
}

export const SendButton = memo(({ reforcus }: SendButtonProps) => {
  const value = useInputStore((s) => s.chatValue)
  const ids = useSelectedId()
  const { submit } = useSubmitChatInput()

  if (!value.trim() && ids.length === 0) return null
  return (
    <button
      onClick={() => {
        reforcus()
        submit()
      }}
      className="h-10 w-12 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform duration-150 active:scale-80"
    >
      <Send className="text-white size-5" />
    </button>
  )
})
