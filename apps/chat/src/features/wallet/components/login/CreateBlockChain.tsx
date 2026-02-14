import { type Dispatch, memo, type SetStateAction, useRef, useState } from 'react'
import BlockChainStepName from './component/BlockChainStepName'
import BlockChainStepSeedPhrase from './component/BlockChainStepSeedPhrase'

interface CreateBlockChainProps {
  onBack: () => void
  onCloseModal: () => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const CreateBlockChain = memo(({ onBack, onCloseModal, setIsLoading }: CreateBlockChainProps) => {
  const seedRef = useRef<string[]>([])
  const [step, setStep] = useState<'seedPhrase' | 'info'>('seedPhrase')

  return (
    <>
      {step === 'seedPhrase' && (
        <BlockChainStepSeedPhrase
          onBack={() => onBack()}
          onNext={(seed) => {
            seedRef.current = seed
            setStep('info')
          }}
        />
      )}
      {step === 'info' && (
        <BlockChainStepName
          seed={seedRef.current}
          onCloseModal={() => {
            onCloseModal()
            onBack()
          }}
          onBack={() => setStep('seedPhrase')}
          onNext={() => {}}
          setIsLoading={setIsLoading}
        />
      )}
    </>
  )
})

export default CreateBlockChain
