import { images } from '@/assets'
import { memo } from 'react'
import { Copyable } from '../Copyable'

export type WalletItemProps = {
  data: Wallet
}

export const WalletItem = memo(({ data }: WalletItemProps) => {
  return (
    <div className="w-40 h-80 relative text-white">
      <div className="absolute inset-0">
        <img src={data.backgroundImage || images.defaultWalletBg} alt={data.name} />
      </div>
      <div className="z-10 relative">
        <p className="break-all">{data.name}</p>

        <Copyable className="break-all">{data.address}</Copyable>
      </div>
    </div>
  )
})
