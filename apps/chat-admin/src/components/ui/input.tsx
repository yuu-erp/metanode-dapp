import { cn, paste } from '@/lib'
import { Copy, X } from 'lucide-react'
import { memo, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export type inputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  leftNode?: ReactNode
  rightNode?: ReactNode
  classNames?: {
    wrapper?: string
    input?: string
  }
  hasPaste?: boolean
  defaultValue?: string
  onInputChange?: (value: string) => void
}

export const Input = memo(
  ({
    classNames,
    leftNode,
    rightNode,
    hasPaste,
    defaultValue = '',
    onInputChange,
    ...props
  }: inputProps) => {
    const [value, setValue] = useState(defaultValue)

    const finalValue = props.value ?? value

    const handleSetValue = (value: string) => {
      setValue(value)
      onInputChange?.(value)
    }

    return (
      <div
        className={cn(
          'flex items-center gap-3 bg-secondary h-10 px-3 rounded-lg',
          classNames?.wrapper
        )}
      >
        {leftNode}
        <input
          className={cn('bg-transparent focus:outline-none flex-1 size-full', classNames?.input)}
          {...props}
          value={finalValue}
          onChange={(e) => {
            handleSetValue(e.target.value)
          }}
        />
        {rightNode}
        {hasPaste && (
          <>
            {value ? (
              <X className="size-4" onClick={() => handleSetValue('')} />
            ) : (
              <Copy className="size-4" onClick={async () => handleSetValue(await paste())} />
            )}
          </>
        )}
      </div>
    )
  }
)
