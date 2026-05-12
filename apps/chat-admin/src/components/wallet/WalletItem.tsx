import { images } from '@/assets'
import { memo } from 'react'
import { Copyable } from '../Copyable'

export type WalletItemProps = {
  data: Wallet
}

export const WalletItem = memo(({ data }: WalletItemProps) => {
  return (
    <div className="h-[70dvh] relative text-white border-app rounded-xl md:rounded-3xl">
      <div className="absolute inset-0 backdrop-blur-app p-10 bg-black/20 rounded-[inherit]">
        <img
          className="size-full object-cover rounded-[inherit]"
          src={data.backgroundImage || images.defaultWalletBg}
          alt={data.name}
        />
      </div>
      <div className="z-10 relative p-15 flex flex-col gap-3">
        <p className="break-all text-2xl">{data.name}</p>
        <Copyable className="break-all">{data.address}</Copyable>
      </div>
    </div>
  )
})
