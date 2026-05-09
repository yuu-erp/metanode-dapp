import { memo, type PropsWithChildren } from 'react'

export type SelectWrapperProps = {
  label?: string
} & PropsWithChildren

export const SelectWrapper = memo(({ children, label }: SelectWrapperProps) => {
  return (
    <div className="flex gap-2 items-center">
      <p>{label}</p>
      {children}
    </div>
  )
})
