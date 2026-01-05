'use client'
import * as React from 'react'

interface MessageItemProps {
  message: string
}
function MessageItem({ message }: MessageItemProps) {
  return (
    <React.Fragment>
      <div className="px-3 py-1">
        <div className="inline-block rounded-xl bg-gray-200 px-3 py-2 text-sm">{message}</div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(MessageItem)
