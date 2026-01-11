import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem
} from '@/shared/components/ui/context-menu'
import { type Conversation, ConversationItem } from './ConversationItem'

interface Props {
  conversation: Conversation
  onClose: () => void
}

export function FocusedOverlay({ conversation, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      onClick={onClose} // click ngoài overlay đóng
    >
      {/* Blur nền */}
      <div className="absolute inset-0 bg-black/80 blurApp" />

      {/* Item conversation nổi giữa */}
      <div
        className="relative z-50 w-[92%] max-w-md rounded-xl bg-neutral-900 p-4 animate-[pop_160ms_ease-out]"
        onClick={(e) => e.stopPropagation()} // prevent close khi click item
      >
        <ConversationItem conversation={conversation} onFocus={() => {}} />
        {/* Menu context luôn hiện */}
        <div className="w-[240px] h-[160px] bg-white"></div>
      </div>
    </div>
  )
}
