import { memo } from 'react'

export type AppLoadingProps = {}

export const AppLoading = memo(({}: AppLoadingProps) => {
  return (
    <div className="h-dvh w-dvw flex items-center justify-center bg-black text-white">
      <p>Loading...</p>
    </div>
  )
})
