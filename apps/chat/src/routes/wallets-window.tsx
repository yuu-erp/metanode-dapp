import { images } from '@/assets/images'
import { useGetAllWallets, useRegisterUser } from '@/features/wallet'
import ListWalletWindows from '@/features/wallet/components/list-wallet.windows'
import Login from '@/features/wallet/components/login'
import ButtonBase from '@/shared/components/button/button-base'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'
import { queryClient } from '@/shared/lib/react-query'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useCallback, useMemo, useState } from 'react'
import type { SwiperClass, SwiperProps } from 'swiper/react'

export const Route = createFileRoute('/wallets-window')({
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

  const activeWallet = useMemo(() => data[activeIndex], [activeIndex, data])

  const onChangeWallet: SwiperProps['onSlideChange'] = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const [step, setStep] = useState(1)

  console.log('activeWalletL: ', activeWallet)

  const handleConnectWallet = useCallback(
    async () => await mutateAsync(activeWallet),
    [activeWallet]
  )

  return (
    <div className="p-5 w-full h-screen flex flex-col items-stretch basis-auto relative shrink-0 overflow-hidden z-0">
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
                <img src={images.logo} alt="" className="w-full h-full object-cover rounded-full" />
              </div>
            </Link>
            <div className="flex flex-1 h-full bg-white/10 rounded-full p-2 flex items-center justify-between">
              <ButtonBase
                className="whitespace-nowrap w-[125px] h-full bg-black/20 border-app rounded-full"
                onClick={() => {
                  onOpen()
                  setStep(1)
                }}
                // onClick={onClickOpenWalletCreate}
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
                onClick={() => {
                  onOpen()
                  setStep(0)
                }}
              >
                <span>Import Wallet</span>
              </ButtonBase>
            </div>
          </div>
        </div>
      </div>
      <Login defaultStep={step} isOpenLogin={isOpen} onClose={onClose} />
    </div>
  )
}
