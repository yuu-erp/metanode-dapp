import { useAllWallets } from '@/modules/wallet/all-wallets'
import { memo } from 'react'
import { WalletItem } from './WalletItem'

export type ListWalletProps = {}

export const ListWallet = memo(({}: ListWalletProps) => {
  const { data } = useAllWallets()

  return (
    <div className="size-full flex items-center justify-center bg-amber-100 ">
      <div className="flex p-3">
        {data?.map((walllet) => (
          <WalletItem data={walllet} />
        ))}
      </div>
    </div>
  )
})
