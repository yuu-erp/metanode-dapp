'use client'
import * as React from 'react'

interface ItemSelectedMethodProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  content: string
  img: string
}
function ItemSelectedMethod({ title, content, img, ...props }: ItemSelectedMethodProps) {
  return (
    <div
      className="w-full background-card rounded-2xl p-5 flex flex-col items-center justify-center gap-2"
      {...props}
    >
      <img src={img} alt="" className="size-16" />
      <h3 className="text-black/60 font-bold text-lg">{title}</h3>
      <span className="text-center text-black/40 text-sm font-medium">{content}</span>
    </div>
  )
}

export default React.memo(ItemSelectedMethod)
