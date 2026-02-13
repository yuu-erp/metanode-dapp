import { motion } from 'framer-motion'
import React from 'react'
import { Keyboard, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide, type SwiperProps } from 'swiper/react'

import 'swiper/css'
import CardWallet from './card-wallet'
import type { Wallet } from '@/modules/wallet'

const fakeSlides = Array.from({ length: 9 }, (_, i) => `Slide ${i + 1}`)

interface ListWalletWindowsProps extends SwiperProps {
  data?: Wallet[]
}
const ListWalletWindows = React.forwardRef<HTMLDivElement, ListWalletWindowsProps>((props, ref) => {
  const { data = [], ...rest } = props
  return (
    <div
      ref={ref}
      className="relative z-10 flex h-full w-full max-w-[960px] flex-1 items-center justify-center overflow-hidden px-4 lg:max-w-[1536px] mx-auto"
    >
      <Swiper
        effect="coverflow"
        slidesPerView={2.5}
        spaceBetween={-60}
        grabCursor={false}
        centeredSlides
        mousewheel={{
          forceToAxis: true,
          thresholdDelta: 100,
          thresholdTime: 0,
          releaseOnEdges: true,
          sensitivity: 1
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false
        }}
        pagination={{ clickable: true }}
        modules={[Navigation, Mousewheel, Keyboard]}
        className="flex h-full w-full items-center justify-center overflow-visible"
        {...rest}
      >
        {data.map((wallet, idx) => (
          <SwiperSlide key={idx} className="z-10 !flex h-full items-center justify-center">
            {({ isActive, isPrev, isNext }) => {
              const isSingle = fakeSlides.length === 1
              const active = isSingle ? true : isActive
              const prev = isSingle ? false : isPrev
              const next = isSingle ? false : isNext

              return (
                <motion.div
                  initial={{ y: 0, x: 0 }}
                  animate={{
                    y: active ? -25 : 25,
                    x: prev ? 120 : next ? -120 : 0,
                    scale: 1
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                  className={`swiper-no-swiping pointer-events-auto relative flex h-[85%] w-[80%] items-center justify-center overflow-hidden lg:mb-0 rounded-2xl ${
                    active || prev || next ? 'shrink-0' : ''
                  }`}
                >
                  <div className="border-app relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-3xl bg-black/40 px-6 lg:px-12 pt-3 lg:pt-6 pb-6 lg:pb-12 text-white">
                    <p className="text-center text-2xl font-bold">Wallet {idx + 1}</p>
                    <CardWallet
                      name={wallet.name}
                      address={wallet.address}
                      totalBalanceString={wallet.totalBalanceString}
                      decimals={15}
                      symbol="MTD"
                      backgroundImage={wallet.backgroundImage}
                      className="h-full w-full"
                    />
                  </div>
                </motion.div>
              )
            }}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
})

export default React.memo(ListWalletWindows)
