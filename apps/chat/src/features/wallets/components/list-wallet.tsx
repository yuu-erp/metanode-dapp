'use client'

import * as React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import type { Wallet } from '@metanodejs/system-core'
import CardWallet from './card-wallet'

interface WalletListSliderProps {
  wallets: Wallet[]
}

function ListWallet({ wallets }: WalletListSliderProps) {
  if (!wallets?.length) return null

  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1.3}
        centeredSlides
        pagination={{ clickable: true }}
        className="w-full max-w-[420px] px-4 pb-6 flex items-center justify-center"
        breakpoints={{
          640: {
            slidesPerView: 2
          },
          768: {
            slidesPerView: 2
          }
        }}
      >
        {wallets.map((wallet) => (
          <SwiperSlide key={wallet.id} className="flex justify-center items-center w-full h-full">
            <CardWallet
              name={wallet.name}
              address={wallet.address}
              totalBalanceString={wallet.totalBalanceString}
              decimals={15}
              symbol="MTN"
              backgroundImage={wallet.backgroundImage}
              className="h-full max-h-[440px] w-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default React.memo(ListWallet)
