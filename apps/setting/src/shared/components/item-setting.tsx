'use client'
import * as React from 'react'

interface ItemSettingProps extends React.HTMLAttributes<HTMLDivElement> {
  isDivider?: boolean
  img?: string
  rightNode?: React.ReactNode
  title: string
}
function ItemSetting({ isDivider, img, rightNode, title, ...props }: ItemSettingProps) {
  return (
    <React.Fragment>
      <div className="flex items-center gap-2 p-2" {...props}>
        {img && <img src={img} alt="" className="size-8 shrink-0 rounded-[6px]" />}
        <div className="flex-1 text-black/60 font-semibold">
          <span>{title}</span>
        </div>
        {rightNode && rightNode}
      </div>
      {isDivider && (
        <div className="px-2 w-full py-1">
          <div className="w-full h-px bg-white/60"></div>
        </div>
      )}
    </React.Fragment>
  )
}

export default React.memo(ItemSetting)
