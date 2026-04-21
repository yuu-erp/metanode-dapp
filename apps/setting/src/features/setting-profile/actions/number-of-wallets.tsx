'use client'
import * as React from 'react'
import ItemSetting from '@/shared/components/item-setting'
import { images } from '@/assets/images'
import { ChevronRight } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

function NumberOfWallets() {
  const navigate = useNavigate()
  return (
    <ItemSetting
      img={images.wallets}
      title="Number of Wallets"
      isDivider
      rightNode={
        <div className="flex items-center gap-1 text-muted-foreground text-sm font-semibold">
          <span className="text-muted-foreground">1 Wallet</span>
          <ChevronRight className="size-5" />
        </div>
      }
      onClick={() => navigate({ to: '/' })}
    />
  )
}

export default React.memo(NumberOfWallets)
