'use client'
import * as React from 'react'
import { ConversationItem, type Conversation } from './ConversationItem'
import { FocusedOverlay } from './FocusedOverlay'

const MOCK_DATA: Conversation[] = [
  { id: '1', name: 'Alice', lastMessage: 'Hello 👋' },
  { id: '2', name: 'Bob', lastMessage: 'How are you?' },
  { id: '3', name: 'Charlie', lastMessage: 'Let’s meet tomorrow' }
]

export default function ConversationList() {
  const [focused, setFocused] = React.useState<Conversation | null>(null)
  console.log({ focused })
  return (
    <div className="relative h-full text-white">
      <div className="divide-y divide-white/5">
        {MOCK_DATA.map((c) => (
          <ConversationItem key={c.id} conversation={c} onFocus={setFocused} />
        ))}
      </div>

      {focused && <FocusedOverlay conversation={focused} onClose={() => setFocused(null)} />}
    </div>
  )
}
