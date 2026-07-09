import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog'
import { Button } from '@headlessui/react'
import { getHiddenWallet, type Wallet } from '@metanodejs/system-core'
import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import QRCode from 'react-qrcode-logo'

export type WalletQrButtonProps = {
  activeWallet?: Wallet
}

export const WalletQrButton = memo(({ activeWallet }: WalletQrButtonProps) => {
  const { data: hiddenAddress } = useQuery({
    queryKey: ['hiddenAddress'],
    staleTime: 1000 * 15 * 60,
    queryFn: async () => (await getHiddenWallet()).address
  })

  const v1 = JSON.stringify({ address: activeWallet?.address })
  const v2 = JSON.stringify({ address: hiddenAddress })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 rounded-2xl font-bold uppercase disabled:opacity-60 disabled:pointer-events-none bg-white/70 hover:bg-white"
        >
          Show QR
        </Button>
      </DialogTrigger>
      <DialogContent className="flex justify-center">
        <div className="flex flex-col gap-3 items-center">
          <p>Address</p>
          <QRCode value={v1} />
        </div>
        <div className="flex flex-col gap-3 items-center">
          <p>Hidden address</p>
          <QRCode value={v2} />
        </div>
      </DialogContent>
    </Dialog>
  )
})
