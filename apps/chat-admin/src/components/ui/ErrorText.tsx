import { memo } from 'react'

export type ErrorTextProps = {
  error?: Error | null
}

export const ErrorText = memo(({ error }: ErrorTextProps) => {
  if (!error) return null
  return <div className="text-red-500">{error?.message}</div>
})
