'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide, type SwiperProps } from 'swiper/react'
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules'

import type { Wallet } from '@/services/wallets'
import CardWallet from './card-wallet'

interface WalletListSliderProps extends SwiperProps {
  wallets: Wallet[]
}

function ListWallet({ wallets, ...props }: WalletListSliderProps) {
  if (!wallets?.length) return null

  return (
    <div className="relative w-full h-full flex flex-col items-stretch relative shrink-0 basis-auto">
      <Swiper
        slidesPerView={1.2}
        spaceBetween={-50}
        centeredSlides={true}
        className="w-full h-full !flex !items-center !justify-center overflow-visible"
        keyboard={{ enabled: true }}
        mousewheel={{ forceToAxis: false, thresholdDelta: 10, sensitivity: 1 }}
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false
        }}
        modules={[Mousewheel, Keyboard, EffectCoverflow]}
        {...props}
      >
        {wallets.map((wallet, idx) => (
          <SwiperSlide key={wallet.address} className="w-[320px] h-full overflow-hidden">
            {({ isActive }) => {
              return (
                <motion.div
                  variants={{
                    enter: {
                      opacity: 1,
                      scale: 1,
                      speed: 300
                    },
                    exit: {
                      opacity: 0.4,
                      scale: 0.92
                    }
                  }}
                  className="w-full h-full flex items-center justify-center"
                  animate={isActive ? 'enter' : 'exit'}
                >
                  <div className="border-app relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-4xl bg-black/40 px-6 lg:px-12 pt-3 lg:pt-6 pb-6 lg:pb-12 text-white">
                    <p className="text-center text-2xl font-bold [text-shadow:1px_1px_2px_rgba(0,0,0,0.6)]">
                      Wallet {idx + 1}
                    </p>
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
}

export default React.memo(ListWallet)
