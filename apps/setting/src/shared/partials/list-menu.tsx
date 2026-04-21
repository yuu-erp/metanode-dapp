'use client'
import * as React from 'react'
import ItemMenu from '../components/item-menu'
import { cn } from '../lib/utils'
import { MENU_LIST } from '@/constants'
import { useI18N } from '../hooks'
import { Link } from '@tanstack/react-router'

interface ListMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

function ListMenu({ className, ...props }: ListMenuProps) {
  const { t } = useI18N()

  return (
    <div className={cn('w-full flex-1 pb-5 overflow-hidden', className)} {...props}>
      <div className="w-full h-full overflow-y-auto flex flex-col gap-2 no-scrollbar pb-16">
        {MENU_LIST.map((menu) => (
          <Link key={menu.path} to={menu.path}>
            <ItemMenu title={t(menu.titleKey)} content={t(menu.contentKey)} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default React.memo(ListMenu)
