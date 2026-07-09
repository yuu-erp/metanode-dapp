import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ButtonBottom from './ButtonBottom'
import Container from './Container'
import CustomSeed from './CustomSeed'
import { toPng } from 'html-to-image'
import { QRCode } from 'react-qrcode-logo'
import { ImageDown } from 'lucide-react'
import { handleGetErrorNative } from '@/shared/utils/errorNative'
import { toast } from 'sonner'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { useGetAllWallets } from '@/features/wallet/hooks'
import { createWallet, getSeed } from '@metanodejs/system-core'
import { seedPhraseToString } from '@/shared/utils/createwallet'
import Input from './Input'

const ItemSeedPhrase = memo(({ content, index }: { content: string; index: number }) => {
  return (
    <span className="flex h-9 md:h-[42px] items-center justify-center rounded-xl px-2 font-customMedium text-sm md:text-[1rem]/[1.5rem] tracking-[-1%] bg-white">
      <span className="text-black/80 mr-1">
        {index < 9 ? '0' : ''}
        {index}.
      </span>
      <span>{content}</span>
    </span>
  )
})

interface BlockChainStepSeedPhraseProps {
  onBack: () => void
  onNext: (seed: string[]) => void
}

const BlockChainStepSeedPhrase = memo(({ onBack, onNext }: BlockChainStepSeedPhraseProps) => {
  const qrRef = useRef<any>(null)

  const [error] = useState<string>('')
  const [screen, setScreen] = useState<'random' | 'custom'>()
  const [seedPhrase, setSeedPhrase] = useState<Array<string>>([])
  const { onClose } = useLoginModalStore()
  const [name, setName] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)

  const { refetch } = useGetAllWallets()
  useEffect(() => {
    console.log('UI WALLET WEB CHAT ----- ')
    ;(async () => {
      try {
        const res = await getSeed()
        console.log('UI WALLET WEB CHAT - GET SEED ----- ', res)
        setSeedPhrase(res.listSeed)
      } catch (error) {
        console.error('UI WALLET WEB CHAT - GET SEED - ERROR ----- ', error)
      }
    })()
  }, [])

  const submitCustomSeed = useCallback((seeds: string[]) => {
    setSeedPhrase(seeds)
    setScreen('random')
  }, [])

  const handleNext = useCallback(async () => {
    if (!name) {
      return toast.error('Enter name please')
    }
    setIsLoading(true)

    try {
      const wallet = await createWallet({
        seed: seedPhrase,
        name: name,
        backgroundImage: ''
      })
      console.log('wallet', wallet)
      await refetch()
      onClose()
    } catch (error) {
      toast.error(handleGetErrorNative(error))
    } finally {
      setIsLoading(false)
    }
  }, [onNext, seedPhrase, name])

  const downloadSeedPhraseQR = useCallback(async () => {
    if (qrRef.current === null) return
    try {
      const dataUrl = await toPng(qrRef.current)
      const link = document.createElement('a')
      link.href = dataUrl
      const time = new Date().getTime()
      link.download = `seed_phrase_${time}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating QR code image', error)
    }
  }, [])

  const copySeed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(seedPhraseToString(seedPhrase))
      toast.success('Success copied')
    } catch (error) {
      toast.error('Copied faild')
      console.log('Error copying text: ', error)
    }
  }, [seedPhrase])

  if (screen === 'custom')
    return <CustomSeed onBack={() => setScreen('random')} submit={submitCustomSeed} />

  return (
    <>
      <div className="wrapper-content flex h-full flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-2">
          <span className="font-customSemiBold text-[1.25rem]/[1.625rem]">
            Create with Seed Phrase!
          </span>
          <Input
            value={name}
            onInputChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
          />
          <span className="text-[0.875rem]/[1.375rem]">
            Please save these 24 words on a piece of paper. This seed will allow you to sign in your
            account.
          </span>
        </div>

        <Container className="flex grow flex-col gap-4 py-5">
          <div className="flex flex-wrap gap-2">
            {seedPhrase?.map((seed, i) => (
              <ItemSeedPhrase content={seed} index={i + 1} key={i} />
            ))}
          </div>

          <div className="min-h-[1.5px] w-full bg-[#0D0D0D]/[.12]" />

          {/* <p
            className="cursor-pointer text-center font-semibold underline"
            onClick={() => setScreen('custom')}
          >
            Custom your seed phrase
          </p> */}

          {error && <div className="text-[0.8rem] text-red-500">{error}</div>}
          <button onClick={copySeed} className="underline">
            Copy your seed
          </button>
          <div className="w-full flex items-center justify-center">
            {seedPhrase.length === 24 && (
              <div ref={qrRef} className="rounded-xl overflow-x-hidden">
                <QRCode value={seedPhraseToString(seedPhrase)} size={200} />
              </div>
            )}
          </div>

          <button
            className="mt-auto flex items-center justify-center gap-2"
            onClick={downloadSeedPhraseQR}
          >
            <span className="text-[1rem]/[1.625rem]">Save your QR code in your device</span>
            <ImageDown />
          </button>
        </Container>
      </div>
      <ButtonBottom
        className="pt-5"
        title="Continue"
        onBack={onBack}
        onNext={handleNext}
        isLoading={isLoading}
      />
    </>
  )
})

export default BlockChainStepSeedPhrase
