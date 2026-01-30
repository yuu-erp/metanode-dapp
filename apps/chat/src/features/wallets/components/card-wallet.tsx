'use client'

import { cn } from '@/shared/lib'
import { handleBackgroundWallet } from '@/shared/utils'
import { formatUnits } from 'ethers'
import * as React from 'react'

interface CardWalletProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundImage?: string
  name?: string
  address?: string
  totalBalanceString?: string // on-chain amount
  decimals?: number
  symbol?: string
}

function CardWallet({
  totalBalanceString = '0',
  decimals = 18,
  symbol = 'MTD',
  address = '',
  name = '',
  backgroundImage = '',
  className,
  ...props
}: CardWalletProps) {
  const displayBalance = React.useMemo(() => {
    try {
      const value = formatUnits(totalBalanceString, decimals)

      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      }).format(Number(value))
    } catch {
      return '0'
    }
  }, [totalBalanceString, decimals])

  return (
    <div className={cn(className)} {...props}>
      <div
        className="w-full h-full flex items-center relative rounded-4xl overflow-hidden"
        style={{
          background: handleBackgroundWallet(backgroundImage)
        }}
      >
        <div className="flex w-full h-full flex-col justify-between p-5 gap-3">
          <div className="flex flex-col gap-2">
            {name && (
              <p className="font-bold text-xl [text-shadow:1px_1px_2px_rgba(0,0,0,0.6)]">{name}</p>
            )}
            {address && (
              <p className="line-clamp-2 break-all font-medium [text-shadow:1px_1px_2px_rgba(0,0,0,0.6)]">
                0x{address}
              </p>
            )}
          </div>

          <div className="px-3 py-2 rounded-full max-w-[60%] max-sm:max-w-full w-full border-app line-clamp-1 font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.6)]">
            {displayBalance} {symbol}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(CardWallet)
