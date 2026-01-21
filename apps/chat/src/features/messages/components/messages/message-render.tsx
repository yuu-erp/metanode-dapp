'use client'
import * as React from 'react'

interface MessageRenderProps {
  type?: 'text' | 'sticker'
  content?: string
}
function MessageRender({ type = 'text', content = '' }: MessageRenderProps) {
  if (!content) return null
  const renderContent = () => {
    switch (type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words font-normal">{content}</p>
      default:
        return <p className="text-sm opacity-70">[Tin nhắn không hỗ trợ]</p>
    }
  }
  return <div className="text-base">{renderContent()}</div>
}

export default React.memo(MessageRender)
