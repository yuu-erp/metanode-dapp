import { type InputHTMLAttributes, memo, useCallback, useState } from 'react'
import ButtonBottom from './ButtonBottom'
import { findAllDuplicateIndices } from '@/shared/utils/createwallet'

interface ArrayItem {
  [key: number]: string
}

interface ICustomSeed {
  onBack: () => void
  submit: (data: string[]) => void
}
const seedLength = 24

const CustomSeed = memo(({ onBack, submit }: ICustomSeed) => {
  const [customData, setCustomData] = useState<ArrayItem>({})
  const [emptyError, setEmptyError] = useState<number[]>([])
  const [duplicateError, setDuplicateError] = useState<number[]>([])
  const [specialCharError, setSpecialCharError] = useState<number[]>([])

  const specialCharRegex = /[^a-zA-Z0-9\s]/

  const onChange = useCallback(
    (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      setCustomData((prev) => {
        const newData = { ...prev, [i]: value }
        const updatedCustomData = Array.from({ length: seedLength }, (_, idx) => newData[idx] || '')

        // Check for special characters
        const specialCharError = updatedCustomData
          .map((val, idx) => (specialCharRegex.test(val) ? idx : -1))
          .filter((idx) => idx !== -1)
        setSpecialCharError(specialCharError)

        // Check for duplicates
        const checkDuplicate = findAllDuplicateIndices(updatedCustomData)
        const duplicateError = Object.values(checkDuplicate).flat()
        setDuplicateError(duplicateError)

        return newData
      })
    },
    []
  )

  const handleSubmit = useCallback(() => {
    const result = Array.from({ length: seedLength }, (_, idx) => customData[idx] || '')

    // Check for empty inputs
    const emptyError = result
      .map((val, idx) => (!val.trim() ? idx : -1))
      .filter((idx) => idx !== -1)
    setEmptyError(emptyError)

    // Check for duplicates
    const checkDuplicate = findAllDuplicateIndices(result)
    const duplicateError = Object.values(checkDuplicate).flat()
    setDuplicateError(duplicateError)

    // Check for special characters
    const specialCharError = result
      .map((val, idx) => (specialCharRegex.test(val) ? idx : -1))
      .filter((idx) => idx !== -1)
    setSpecialCharError(specialCharError)

    // Prevent form submission if there are errors
    if (emptyError.length > 0 || duplicateError.length > 0 || specialCharError.length > 0) return

    console.log('submit', result)
    submit(result)
  }, [customData, submit])

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex flex-col gap-3 text-white">
        <span className="font-customSemiBold text-[1.25rem]/[1.625rem] capitalize">
          Create with Seed Phrase!
        </span>
        <span className="text-[0.875rem]/[1.375rem] white/[.64]">
          Please save these 24 words on a piece of paper. This seed will allow you to sign in your
          account.
        </span>
      </div>
      <div className="scroll-bar-xs grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-1">
        {Array.from({ length: seedLength }).map((_, i) => (
          <Input
            key={i}
            number={i + 1}
            error={
              emptyError.includes(i)
                ? 'Empty word'
                : specialCharError.includes(i)
                  ? 'Special characters not allowed'
                  : duplicateError.includes(i)
                    ? 'Duplicate word'
                    : ''
            }
            value={customData?.[i] || ''}
            onChange={onChange(i)}
          />
        ))}
      </div>

      <ButtonBottom title="Create" onBack={onBack} onNext={handleSubmit} />
    </div>
  )
})

export default CustomSeed

const Input = memo(
  ({
    number,
    error,
    ...props
  }: { number: number; error: string } & InputHTMLAttributes<HTMLInputElement>) => {
    return (
      <div className="relative col-span-1 w-full flex items-center">
        <label className="absolute left-[10px] top-1/2 flex size-6 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-solid text-sm">
          {number}
        </label>
        <input
          {...props}
          className="w-full rounded-lg bg-black/40 border-app p-[10px] pl-12 text-[1rem] focus:outline-none"
          placeholder="Enter your word"
        />
        {error && <p className="ml-1 mt-1 text-[12px] text-[#ff0000]">{error}</p>}
      </div>
    )
  }
)
