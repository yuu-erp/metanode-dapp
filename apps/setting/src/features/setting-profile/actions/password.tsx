'use client'
import * as React from 'react'
import ItemSetting from '@/shared/components/item-setting'
import { images } from '@/assets/images'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

function Password() {
  const navigate = useNavigate()
  return (
    <ItemSetting
      img={images.lock}
      title="Password"
      isDivider
      rightNode={
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
          <span className="text-muted-foreground">set</span>
          <ChevronRight className="size-5" />
        </div>
      }
      onClick={() => navigate({ to: '/' })}
    />
  )
}

export default React.memo(Password)
