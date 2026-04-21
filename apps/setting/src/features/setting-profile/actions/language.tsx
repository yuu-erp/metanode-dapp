'use client'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import ItemSetting from '@/shared/components/item-setting'

function Language() {
  const navigate = useNavigate()
  return (
    <ItemSetting
      title="Language"
      rightNode={
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
          <ChevronRight className="size-5" />
        </div>
      }
      onClick={() => navigate({ to: '/' })}
    />
  )
}

export default React.memo(Language)
