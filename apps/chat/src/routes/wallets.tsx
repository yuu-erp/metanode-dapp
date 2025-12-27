import ButtonGroupMobile from '@/features/wallets/components/button-group-mobile'
import ListWallet from '@/features/wallets/components/list-wallet'
import { useGetAllWallets, useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallets')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18N()
  const { data = [] } = useGetAllWallets()
  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-0')}>
      <div className="w-full h-full flex flex-col">
        <div className="w-full text-center">
          <h1 className="font-bold text-3xl">{t('title.connectMainWallet')}</h1>
        </div>
        <div className="flex-1 py-14">
          <ListWallet wallets={data} />
        </div>
        <ButtonGroupMobile />
      </div>
    </div>
  )
}
