import { Copy, X } from 'lucide-react'
import { memo, useCallback } from 'react'

interface InputProps {
  placeholder: string
  value?: string
  onInputChange: (e: any) => void
}

const Input = memo(({ placeholder, value, onInputChange }: InputProps) => {
  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText()
    onInputChange({ target: { value: text } })
  }, [])

  const handleRemove = useCallback(async () => {
    onInputChange({ target: { value: '' } })
  }, [])

  return (
    <div className="relative flex w-full items-center rounded-lg bg-white">
      <input
        className="grow rounded-lg bg-transparent p-3 text-[1rem] focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={onInputChange}
      />
      {value === '' ? (
        <Copy className="mx-3 h-6 w-6" onClick={handlePaste} />
      ) : (
        <X className="mx-3 size-6 cursor-pointer" onClick={handleRemove} />
      )}
    </div>
  )
})

export default Input
