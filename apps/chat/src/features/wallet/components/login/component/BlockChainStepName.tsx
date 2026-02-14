import { cn } from '@/shared/lib'
import { type Dispatch, memo, type SetStateAction, useCallback, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import ButtonBottom from './ButtonBottom'
import Container from './Container'
import ModalSuccess from './ModalSuccess'

interface BlockChainStepSeedPhraseProps {
  isImport?: boolean
  address?: string
  seed?: string[]
  onBack: () => void
  onNext: () => void
  onCloseModal: () => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const BlockChainStepName = memo(
  ({ isImport = false, address = '', onBack, onCloseModal }: BlockChainStepSeedPhraseProps) => {
    const [prikey] = useState<string>('')
    const [modalSuccess, setModalSuccess] = useState<boolean>(false)

    const registerForm = useForm<any>({
      mode: 'onBlur'
    })

    const { handleSubmit, control } = registerForm

    const handlRegister = useCallback(async (_values: any) => {}, [address])

    const submit = useCallback(async (_values: any) => {}, [isImport])

    return (
      <>
        <div
          className={cn(
            'wrapper-content flex h-full w-full flex-col overflow-y-auto',
            modalSuccess && 'blur-lg'
          )}
        >
          <Container className="flex flex-col gap-5 pb-5 text-[1.25rem]/[1.5rem] text-[#0D0D0D]">
            <FormProvider {...registerForm}>
              <div className="flex flex-col gap-3">
                <span className="font-customSemiBold text-[16px]/[26px] capitalize">
                  form.label.name{' '}
                  <span className="font-customSemiBold text-[600] text-red-500">*</span>
                </span>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        <input
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            let value = e.target.value
                            field.onChange(value)
                          }}
                          placeholder="form.placeholder.enter"
                          className="rounded-lg bg-[#FFFFFF] p-[10px] text-[1rem] focus:outline-none"
                        />
                        {fieldState.error && (
                          <span className="text-[0.75rem]/[1rem] text-red-500">
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-customSemiBold text-[16px]/[26px] capitalize">
                  form.label.email{' '}
                  <span className="font-customSemiBold text-[600] text-red-500">*</span>
                </span>
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        <input
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            let value = e.target.value
                            field.onChange(value)
                          }}
                          placeholder="form.placeholder.enter"
                          className="rounded-lg bg-[#FFFFFF] p-[10px] text-[1rem] focus:outline-none"
                        />
                        {fieldState.error && (
                          <span className="text-[0.75rem]/[1rem] text-red-500">
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-customSemiBold text-[16px]/[26px] capitalize">
                  "form.label.phone-number"
                  <span className="font-customSemiBold text-[600] text-red-500">*</span>
                </span>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        <input
                          {...field}
                          // type='number'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            let value = e.target.value
                            field.onChange(value)
                          }}
                          placeholder="form.placeholder.enter"
                          className="rounded-lg bg-[#FFFFFF] p-[10px] text-[1rem] focus:outline-none"
                        />
                        {fieldState.error && (
                          <span className="text-[0.75rem]/[1rem] text-red-500">
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-customSemiBold text-[16px]/[26px] capitalize">
                  "form.label.referrer"
                  <span className="font-customSemiBold text-[600] text-red-500">*</span>
                </span>
                <Controller
                  control={control}
                  name="parent"
                  render={({ field, fieldState }) => {
                    return (
                      <>
                        <div className="relative">
                          <input
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              let value = e.target.value
                              field.onChange(value)
                            }}
                            placeholder="form.placeholder.enter"
                            className="w-full rounded-lg bg-[#FFFFFF] p-[10px] pr-12 text-[1rem] focus:outline-none"
                          />
                          <button
                            onClick={async () => {
                              const string = await navigator.clipboard.readText()
                              field.onChange(string)
                            }}
                          >
                            {/* <CopyIcon className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer xs:size-5 sm:size-6" /> */}
                          </button>
                        </div>
                        {fieldState.error && (
                          <span className="text-[0.75rem]/[1rem] text-red-500">
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )
                  }}
                />
              </div>
            </FormProvider>
          </Container>

          {prikey !== '' && (
            <div className="opacity-0">
              {/* <QRCode ref={qrRef} size={188} value={prikey} viewBox={`0 0 188 188`} /> */}
            </div>
          )}
        </div>

        <ButtonBottom
          className="pt-5"
          title="button.create"
          onBack={onBack}
          onNext={isImport ? handleSubmit(handlRegister) : handleSubmit(submit)}
        />

        {modalSuccess && (
          <ModalSuccess
            onClose={() => {
              setModalSuccess(false)
              onCloseModal()
            }}
          />
        )}
      </>
    )
  }
)

export default BlockChainStepName
