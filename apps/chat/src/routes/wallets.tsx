import { ButtonGroup, ListWallet, useRegisterUser } from '@/features/wallets'
import { createCurrentAccountQueryOptions, useGetAllWallets, useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { queryClient } from '@/shared/lib/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import type { SwiperClass, SwiperProps } from 'swiper/react'

export const Route = createFileRoute('/wallets')({
  loader: async () => {
    try {
      const currentAccount = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())
      if (currentAccount && currentAccount.isActive) {
        return redirect({ to: '/' })
      }
      return {}
    } catch (error) {
      console.error(error)
      return {}
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18N()

  const { data = [] } = useGetAllWallets()

  const { mutateAsync, isPending } = useRegisterUser()

  const [activeIndex, setActiveIndex] = useState(0)

  const activeWallet = useMemo(() => data[activeIndex], [activeIndex, data])

  const onChangeWallet: SwiperProps['onSlideChange'] = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const handleConnectWallet = useCallback(
    async () => await mutateAsync(activeWallet),
    [activeWallet]
  )

  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <div className="w-full h-full flex flex-col">
        <div className="w-full text-center">
          <h1 className="font-bold text-3xl">{t('title.connectMainWallet')}</h1>
        </div>
        <div className="flex-1 py-14">
          <ListWallet wallets={data} onSlideChange={onChangeWallet} />
        </div>
        <ButtonGroup onConnectWallet={handleConnectWallet} isLoading={isPending} />
      </div>
    </div>
  )
}
