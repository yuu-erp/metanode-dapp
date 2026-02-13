import { Transition } from '@headlessui/react'
import { memo, useEffect, useRef, useState } from 'react'

import AnimationPage from './component/AnimationPage'
import BlockChainStepName from './component/BlockChainStepName'
import CreateBlockChain from './CreateBlockChain'
import ImportPrivateKey from './ImportPrivateKey'
import ImportSeedphrase from './ImportSeedphrase'
import LoginHome from './LoginHome'
import { cn } from '@/shared/lib'

const Login = memo(
  ({
    isOpenLogin,
    onClose,
    defaultStep = 1
  }: {
    isOpenLogin?: boolean
    onClose?: () => void
    defaultStep: number
  }) => {
    const addressRef = useRef<string>('')

    const [step, setStep] = useState<number>(1)
    const [_isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
      if (isOpenLogin) {
        document.body.classList.add('overflow-hidden')
      } else {
        document.body.classList.remove('overflow-hidden')
      }
      return () => document.body.classList.remove('overflow-hidden')
    }, [isOpenLogin])

    return (
      <>
        <Transition
          show={isOpenLogin}
          enter="ease-out duration-500"
          enterFrom="opacity-0 translate-x-full"
          enterTo="opacity-100 translate-x-0"
          leave="ease-in duration-500"
          leaveFrom="opacity-100 translate-x-0"
          leaveTo="opacity-0 translate-x-full"
        >
          <div
            onClick={onClose}
            className={`fixed inset-0 z-[1500] h-screen w-screen overflow-hidden bg-black/[.20] shadow-box-content-model backdrop-blur-md transition-all duration-1000 ease-in-out`}
          >
            <div className="relative flex size-full justify-end p-5">
              <div
                className={cn(
                  'h-[92.5%]',
                  'relative flex aspect-[9/20] overflow-hidden rounded-2xl bg-white/10 p-5 backdrop-blur-[80px] h-full xs:min-w-[300px] sm:min-w-[340px] lg:h-full',
                  step === 1 && 'pt-0'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <AnimationPage
                  isVisble={step === 1}
                  className={step === 1 ? 'block' : 'hidden'}
                  homePage={true}
                >
                  <LoginHome setStep={setStep} defaultTab={defaultStep} />
                </AnimationPage>
                <AnimationPage isVisble={step === 2} className={step === 2 ? 'block' : 'hidden'}>
                  <ImportSeedphrase
                    onBack={() => setStep(1)}
                    onNext={(address: string) => {
                      addressRef.current = address
                      setStep(5)
                    }}
                    onCloseModal={() => {}}
                    setIsLoading={setIsLoading}
                  />
                </AnimationPage>
                <AnimationPage isVisble={step === 3} className={step === 3 ? 'block' : 'hidden'}>
                  <ImportPrivateKey
                    onBack={() => setStep(1)}
                    onNext={(address: string) => {
                      addressRef.current = address
                      setStep(5)
                    }}
                    onCloseModal={() => {}}
                    setIsLoading={setIsLoading}
                  />
                </AnimationPage>
                <AnimationPage isVisble={step === 4} className={step === 4 ? 'block' : 'hidden'}>
                  <CreateBlockChain
                    onBack={() => setStep(1)}
                    onCloseModal={() => {}}
                    setIsLoading={setIsLoading}
                  />
                </AnimationPage>
                <AnimationPage isVisble={step === 5} className={step === 5 ? 'block' : 'hidden'}>
                  <BlockChainStepName
                    isImport
                    seed={[]}
                    address={addressRef.current}
                    onBack={() => setStep(step === 2 ? 2 : 3)}
                    onCloseModal={() => {}}
                    setIsLoading={setIsLoading}
                    onNext={() => {}}
                  />
                </AnimationPage>
              </div>
            </div>
          </div>
        </Transition>
      </>
    )
  }
)

export default Login
