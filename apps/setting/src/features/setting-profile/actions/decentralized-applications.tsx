'use client'
import * as React from 'react'
import { images } from '@/assets/images'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import ItemSetting from '@/shared/components/item-setting'

function DecentralizedApplications() {
  const navigate = useNavigate()
  return (
    <ItemSetting
      img={images.decentrial}
      isDivider
      title="Decentralized Applications"
      rightNode={
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
          <span className="text-muted-foreground">10</span>
          <ChevronRight className="size-5" />
        </div>
      }
      onClick={() => navigate({ to: '/' })}
    />
  )
}

export default React.memo(DecentralizedApplications)
