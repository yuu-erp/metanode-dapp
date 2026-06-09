import { memo, type FC } from 'react'
import { TextContent } from './content-variants'
import type { WithMessage } from './types'
import { FileContent } from './content-variants/file-content'
import { StickerContent } from './content-variants/sticker-content'

const obj: Record<string, FC<WithMessage>> = {
  text: TextContent,
  file: FileContent,
  sticker: StickerContent
}

export const MessageItemContent = memo(({ data }: WithMessage) => {
  const Comp = obj[data.type]
  return Comp ? <Comp data={data} /> : null
})
