import { Button } from '@/components/ui/button'
import { usePhoneCountry } from '@/hooks/use-fetch-country'
import { cn } from '@/lib/utils'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import PhoneInput, { getCountryCallingCode, isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export const Route = createFileRoute('/register')({
  component: RouteComponent
})

function RouteComponent() {
  const router = useRouter()
  const { data: country } = usePhoneCountry()
  console.log({ country })
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [error, setError] = useState('')

  // set prefix khi detect xong
  useEffect(() => {
    if (!country) return
    // @ts-ignore
    setPhoneNumber('+' + getCountryCallingCode(country))
  }, [country])

  const submit = () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Invalid phone number')
      return
    }
  }

  return (
    <div
      className={cn(
        'w-full h-dvh flex flex-col px-3 overflow-hidden min-h-0',
        window.isHasNotch ? 'pt-14' : 'pt-10'
      )}
    >
      <div>
        <h1 className="text-2xl font-bold">Hi, Welcome!</h1>
        <span>Please enter correct phone number in case of handling any dispute or complaint!</span>
      </div>
      <div className="flex-1 pt-5">
        <PhoneInput
          className=" bg-white px-3 rounded-lg text-black"
          numberInputProps={{
            className: 'focus:outline-none bg-transparent py-3'
          }}
          addInternationalOption={false}
          value={phoneNumber}
          onChange={(val) => setPhoneNumber(val || '')}
          international
          countryCallingCodeEditable={true}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="h-[96px] flex items-center justify-center bg-transparent flex-col gap-1">
        <div className="h-12 w-full flex items-center gap-1">
          <Button
            className="size-12 bg-white rounded-l-xl rounded-r-none"
            onClick={() => router.history.back()}
          >
            <ChevronLeft className="text-black size-5" />
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 bg-white text-black font-bold uppercase text-lg rounded-xl border border-blue-50 z-10 rounded-l-none"
            onClick={submit}
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  )
}
