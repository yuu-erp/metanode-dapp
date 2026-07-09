import { container } from '@/container'
import { ButtonGroup, ListWallet, useGetAllWallets, useRegisterUser } from '@/features/wallet'
import Login from '@/features/wallet/components/login'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { ACCOUNT_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { createFileRoute, redirect } from '@tanstack/react-router'
import React, { useCallback, useMemo, useState } from 'react'
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
  // const { loginOrRegister, isPending: isP } = useLoginOrRegister()

  const [activeIndex, setActiveIndex] = useState(0)
  const [step, setStep] = useState(1)

  const activeWallet = useMemo(() => data[activeIndex], [activeIndex, data])

  const onChangeWallet: SwiperProps['onSlideChange'] = useCallback((swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const handleConnectWallet = useCallback(async () => {
    // loginOrRegister({ address: activeWallet.address })
    await mutateAsync(activeWallet)
    queryClient.invalidateQueries({
      queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
    })
  }, [activeWallet])

  const onCreateWallet = () => {
    if (window.fiaiSDK) {
      onOpen()
      setStep(1)
    } else {
      container.walletService.openCreateWallet()
    }
  }

  const onImportWallet = () => {
    if (window.fiaiSDK) {
      onOpen()
      setStep(0)
    } else {
      container.walletService.openImportWallet()
    }
  }

  return (
    <React.Fragment>
      <div
        className={cn(
          'w-full h-screen flex flex-col max-w-2xl xl:max-w-[80dvw] mx-auto w-screen',
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
            activeWallet={activeWallet}
            onConnectWallet={handleConnectWallet}
            isLoading={isPending}
            onCreateWallet={onCreateWallet}
            onImportWallet={onImportWallet}
          />
        </div>
      </div>
      <Login defaultStep={step} isOpenLogin={isOpen} onClose={onClose} />
    </React.Fragment>
  )
}
