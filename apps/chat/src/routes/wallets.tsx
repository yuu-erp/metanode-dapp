import { images } from '@/assets/images'
import { ButtonGroup, ListWallet, useGetAllWallets, useRegisterUser } from '@/features/wallet'
import ListWalletWindows from '@/features/wallet/components/list-wallet.windows'
import Login from '@/features/wallet/components/login'
import ButtonBase from '@/shared/components/button/button-base'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { ACCOUNT_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import type { SwiperClass, SwiperProps } from 'swiper/react'

export const Route = createFileRoute('/wallets')({
  loader: async () => {
    try {
      const account = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())
      if (account?.isActive) {
        throw redirect({ to: '/' })
      }
      return null
    } catch (err) {
      // redirect throw error → tanstack router sẽ handle
      // còn lỗi khác thì log và cho vào trang bình thường
      if (!(err instanceof Error && 'statusCode' in err)) {
        console.error('Failed to check current account:', err)
      }
      return null
    }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { isOpen, onOpen, onClose } = useLoginModalStore()

  const { data = [] } = useGetAllWallets()

  const { mutateAsync, isPending } = useRegisterUser()

  const [activeIndex, setActiveIndex] = useState(0)
  const [step, setStep] = useState(1)

  const activeWallet = useMemo(() => data[activeIndex], [activeIndex, data])

  const onChangeWallet: SwiperProps['onSlideChange'] = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const handleConnectWallet = useCallback(async () => {
    console.log('thanhduy - connect wallet 1')

    await mutateAsync(activeWallet)
    console.log('thanhduy - connect wallet 2')
    queryClient.invalidateQueries({
      queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
    })
    console.log('thanhduy - connect wallet 3')
  }, [activeWallet])

  const onCreateWallet = () => {
    onOpen()
    setStep(1)
  }

  const onImportWallet = () => {
    onOpen()
    setStep(0)
  }

  return (
    <React.Fragment>
      <div
        className={cn(
          'w-full h-screen flex flex-col max-w-2xl mx-auto xl:hidden',
          window.isHasNotch ? 'pt-14' : 'pt-5'
        )}
      >
        <div className="w-full h-full flex flex-col">
          <div className="w-full text-center">
            <Trans
              parent="h1"
              className="font-bold text-3xl"
              i18nKey="title.connectMainWallet"
              components={{
                1: <span className="text-color" />
              }}
            />
          </div>
          <div className="flex-1 py-14">
            <ListWallet wallets={data} onSlideChange={onChangeWallet} />
          </div>
          <ButtonGroup
            onConnectWallet={handleConnectWallet}
            isLoading={isPending}
            onCreateWallet={onCreateWallet}
            onImportWallet={onImportWallet}
          />
        </div>
      </div>
      <div className="p-5 w-full h-screen flex flex-col items-stretch basis-auto relative shrink-0 overflow-hidden z-0 hidden xl:flex">
        <div className="w-full flex items-center justify-center">
          <div className="text-center text-[2rem] leading-snug font-bold xl:text-[3rem]">
            <span>Connect </span>
            <span className="text-balance-desktop"> Wallet</span>
          </div>
        </div>
        <div className="flex flex-1 w-full h-full pb-[5em] lg:pb-[6%] pt-[1em]">
          <ListWalletWindows data={data} onSlideChange={onChangeWallet} />
        </div>
        <div className="h-[40%] w-[60%] bg-black/50 absolute bottom-5 left-1/2 -translate-x-1/2 rounded-[3em]">
          <div className="w-full relative w-full h-full flex items-center justify-center">
            <div className="h-[56px] w-full absolute bottom-3 px-5 flex gap-5 max-w-[540px]">
              <Link to="/">
                <div className="size-[56px] bg-black/20 rounded-full relative overflow-hidden p-1 flex flex-col justify-center">
                  <img
                    src={images.logo}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </Link>
              <div className="flex flex-1 h-full bg-white/10 rounded-full p-2 flex items-center justify-between">
                <ButtonBase
                  className="whitespace-nowrap w-[125px] h-full bg-black/20 border-app rounded-full"
                  onClick={onCreateWallet}
                >
                  <span>Create Wallet</span>
                </ButtonBase>
                <ButtonBase
                  className="whitespace-nowrap w-[125px] h-full bg-black/20 border-app rounded-full"
                  onClick={handleConnectWallet}
                  disabled={isPending}
                >
                  {isPending ? 'Connecting...' : 'Connect wallet'}
                </ButtonBase>
                <ButtonBase
                  className="whitespace-nowrap w-[125px] h-full bg-black/20 border-app rounded-full"
                  onClick={onImportWallet}
                >
                  <span>Import Wallet</span>
                </ButtonBase>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Login defaultStep={step} isOpenLogin={isOpen} onClose={onClose} />
    </React.Fragment>
  )
}
