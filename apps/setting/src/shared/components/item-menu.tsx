'use client'
import * as React from 'react'

interface ItemMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  content?: string
}
function ItemMenu({ title, content, className, ...props }: ItemMenuProps) {
  return (
    <React.Fragment>
      <div
        className="min-h-16 h-full w-full background-card rounded-2xl px-4 flex items-center justify-center"
        {...props}
      >
        <div className="grid flex-1 text-left text-base leading-tight">
          <span className="truncate font-bold text-black/60">{title}</span>
          <span className="text-muted-foreground truncate text-sm">{content}</span>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ItemMenu)
