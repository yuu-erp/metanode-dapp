'use client'
import { ChatHeader, InputChat } from '@/features/chats'
import { useGetConversationId } from '@/shared/hooks'
import { createFileRoute, useParams } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/_authenticated/conversation/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/conversation/$id' })
  const { data: conversation } = useGetConversationId(id)

  return (
    // <div className="w-full h-[300vh] flex flex-col">
    //   {/* Header */}
    //   <ChatHeader name={conversation?.name} />
    //   <div className="flex-1">
    //     18. Các use-case phổ biến Header dính Sidebar dính Filter panel Section title Column table
    //     Chat date divider Search bar dính (rất giống case app chat bạn đang làm)18. Các use-case phổ
    //     biến Header dính Sidebar dính Filter panel Section title Column table Chat date divider
    //     Search bar dính (rất giống case app chat bạn đang làm)18. Các use-case phổ biến Header dính
    //     Sidebar dính Filter panel Section title Column table Chat date divider Search bar dính (rất
    //     giống case app chat bạn đang làm)18. Các use-case phổ biến Header dính Sidebar dính Filter
    //     panel Section title Column table Chat date divider Search bar dính (rất giống case app chat
    //     bạn đang làm)18. Các use-case phổ biến Header dính Sidebar dính Filter panel Section title
    //     Column table Chat date divider Search bar dính (rất giống case app chat bạn đang làm) 18.
    //     Các use-case phổ biến Header dính Sidebar dính Filter panel Section title Column table Chat
    //     date divider Search bar dính (rất giống case app chat bạn đang làm)18. Các use-case phổ biến
    //     Header dính Sidebar dính Filter panel Section title Column table Chat date divider Search
    //     bar dính (rất giống case app chat bạn đang làm)18. Các use-case phổ biến Header dính Sidebar
    //     dính Filter panel Section title Column table Chat date divider Search bar dính (rất giống
    //     case app chat bạn đang làm)18. Các use-case phổ biến Header dính Sidebar dính Filter panel
    //     Section title Column table Chat date divider Search bar dính (rất giống case app chat bạn
    //     đang làm)18. Các use-case phổ biến Header dính Sidebar dính Filter panel Section title
    //     Column table Chat date divider Search bar dính (rất giống case app chat bạn đang làm)18. Các
    //     use-case phổ biến Header dính Sidebar dính Filter panel Section title Column table Chat date
    //     divider Search bar dính (rất giống case app chat bạn đang làm)
    //   </div>
    //   {/* <ChatHeader name={conversation?.name} /> */}
    //   {/* Input chat - luôn dính bottom */}
    //   <InputChat />
    // </div>
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        willChange: 'transform, height'
      }}
    >
      <header className="h-[120px] flex items-center px-4 bg-zinc-800/80 backdrop-blur shrink-0">
        <div className="font-semibold">Telegram-like Chat</div>
      </header>
      <main id="messages" className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        <div className="bg-zinc-700 rounded-xl p-3 w-fit max-w-[80%]">Hello 👋</div>
        <div className="bg-blue-600 rounded-xl p-3 w-fit max-w-[80%] ml-auto">Hi F!</div>
      </main>
      <footer className="h-[120px] bg-zinc-800 px-3 py-2 shrink-0">
        <input
          type="text"
          placeholder="Message..."
          className="w-full h-full rounded-full px-4 text-black outline-none"
        />
      </footer>
    </div>
  )
}
