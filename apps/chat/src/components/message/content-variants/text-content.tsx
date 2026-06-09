'use client'
import { useUser } from '@/shared/hooks/use-get-conversation-by-address'
import { cn, splitMessageContentWithMentions } from '@/shared/lib'
import * as React from 'react'
import type { WithMessage } from '../types'

function MentionSpan({ contractId }: { contractId: string }) {
  const { data } = useUser(contractId)
  const name = data?.name?.trim()
  const label =
    name && name.length > 0 ? `@${name}` : `@${contractId.slice(0, 6)}…${contractId.slice(-4)}`
  return <span className="font-semibold text-sky-300">{label}</span>
}

function renderUrlFragments(text: string, keyPrefix: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={`${keyPrefix}-u-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3b82f6] hover:underline break-all"
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>
  })
}

export function TextContentWithMentions({ text }: { text: string }) {
  const chunks = splitMessageContentWithMentions(text)
  return (
    <>
      {chunks.map((chunk, i) =>
        chunk.type === 'text' ? (
          <React.Fragment key={`c-${i}`}>
            {renderUrlFragments(chunk.value, `c-${i}`)}
          </React.Fragment>
        ) : (
          <MentionSpan key={`c-${i}-${chunk.id}`} contractId={chunk.id} />
        )
      )}
    </>
  )
}

export function TextContent({ data }: WithMessage) {
  return (
    <div className={cn('text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap')}>
      <TextContentWithMentions text={data.content ?? ''} />
    </div>
  )
}
