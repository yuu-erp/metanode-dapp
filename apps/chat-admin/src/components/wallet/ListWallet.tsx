import { useAllWallets } from '@/modules/wallet/all-wallets'
import { memo, useEffect } from 'react'
import { WalletItem } from './WalletItem'
import { useWalletStore, walletActions } from '@/modules/wallet/wallet.store'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

export type ListWalletProps = {}

export const ListWallet = memo(({}: ListWalletProps) => {
  const { data } = useAllWallets()
  const currentActive = useWalletStore((s) => s.currentActive)

  useEffect(() => {
    if (!data?.length || !!currentActive) return
    walletActions.setCurrentActive(data[0].address)
  }, [data, currentActive])

  return (
    <div className="w-full overflow-hidden max-w-[1000px]">
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        onSlideChange={(swiper) => {
          if (!data?.length) return
          const idx = swiper.realIndex ?? swiper.activeIndex
          const wallet = data[idx]
          if (!wallet) return
          walletActions.setCurrentActive(wallet.address)
        }}
        breakpoints={{
          0: { slidesPerView: 1.3 },
          600: { slidesPerView: 2.2 }
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: false
        }}
        pagination={true}
        modules={[EffectCoverflow]}
        className="mySwiper"
      >
        {data?.map((wallet) => (
          <SwiperSlide key={wallet.address} className="w-full h-100 ">
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
                  <WalletItem data={wallet} />
                </motion.div>
              )
            }}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
})
