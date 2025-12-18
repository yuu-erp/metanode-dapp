'use client'
import * as React from 'react'
import ItemMenu from '../components/item-menu'
import { cn } from '../lib/utils'
import { MENU_LIST } from '@/constants'

interface ListMenuProps extends React.HTMLAttributes<HTMLDivElement> {}
function ListMenu({ className, ...props }: ListMenuProps) {
  return (
    <React.Fragment>
      <div className={cn('w-full flex-1 pb-5 overflow-hidden', className)} {...props}>
        <div className="w-full h-full overflow-y-auto flex flex-col gap-2 no-scrollbar">
          {MENU_LIST.map((menu, idx) => (
            <ItemMenu key={idx} title={menu.title} content={menu.content} />
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ListMenu)
