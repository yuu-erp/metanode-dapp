import { type Dispatch, memo, type SetStateAction, useState } from 'react'

import Anime from './component/Anime'
import ButtonLogin from './component/ButtonLogin'
import Container from './component/Container'
import nodeImg from './nodes.png'
import { cn } from '@/shared/lib'

interface LoginHomeProps {
  setStep: Dispatch<SetStateAction<number>>
  defaultTab?: number
}

const LoginHome = memo(({ setStep, defaultTab = 0 }: LoginHomeProps) => {
  const [tab, setTab] = useState<number>(defaultTab)
  return (
    <>
      <div className="relative flex w-full text-[18px]/[22px] text-white/60">
        <button
          className={cn(
            tab === 0 && 'font-customSemiBold text-white',
            'h-[68px] w-1/2 text-nowrap text-center'
          )}
          onClick={() => setTab(0)}
        >
          Import an <br /> existing wallet
        </button>
        <button
          className={cn(
            tab === 1 && 'font-customSemiBold text-white',
            'h-[68px] w-1/2 text-nowrap text-center'
          )}
          onClick={() => setTab(1)}
        >
          Create a <br /> new wallet
        </button>
        <span className={cn('absolute bottom-0 left-0 h-[1px] w-full bg-[#0D0D0D]/[.44]')}></span>
        <span
          className={cn(
            'absolute bottom-[-0.5px] h-[2px] w-1/2',
            tab === 0 ? 'left-0' : 'left-1/2'
          )}
          style={{
            background: 'linear-gradient(270deg, #5495FC 0%, #31D366 100%)',
            transition: 'left 0.8s'
          }}
        ></span>
      </div>

      <Container>
        <Anime isOpen={tab === 0} className={tab !== 0 ? 'hidden' : 'block'}>
          <div className="mt-5 w-full">
            <p className="font-customBold text-[20px]/[28px]">Welcome back,</p>
            <div className="text-[#0D0D0D]/.[.64] mt-2 text-[14px]/[24px]">
              Import an existing wallet to quickly access and manage your funds for seamless
              shopping.
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <ButtonLogin
              Icon={() => <img src={nodeImg} className="h-10 w-10 object-cover" />}
              content="Import with Seed Phrase "
              onClick={() => {
                setStep(2)
              }}
            />
            <ButtonLogin
              Icon={() => <img src={nodeImg} className="h-10 w-10 object-cover" />}
              content="Import with Private Key"
              onClick={() => {
                setStep(3)
              }}
            />
          </div>
        </Anime>
        <Anime isOpen={tab === 1} className={tab !== 1 ? 'hidden' : 'block'}>
          <div className="mt-5 w-full">
            <p className="font-customBold text-[20px]/[28px]">Welcome</p>
            <p className="mt-2 text-[14px]/[24px] text-white/[.64]">
              Create a new wallet to start shopping and enjoy exclusive offers.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {tab === 1 && (
              <ButtonLogin
                Icon={() => <img src={nodeImg} className="h-10 w-10 object-cover" />}
                content="Create with Seed Phrase"
                onClick={() => {
                  setStep(4)
                }}
              />
            )}
          </div>
        </Anime>
      </Container>

      <div className="w-full justify-self-end text-center text-[16px]/[16px] text-white/[.64]">
        {tab === 0 ? 'New User?' : 'Have an wallet?'}
        <span
          onClick={() => {
            setTab(tab === 0 ? 1 : 0)
          }}
          className="font-customSemiBold text-white underline underline-offset-2 ml-1"
        >
          {tab === 0 ? `Create a new wallet` : 'Import an wallet'}
        </span>
      </div>
    </>
  )
})

export default LoginHome
