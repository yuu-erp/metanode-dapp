'use client'

import { Button } from '@/components/ui/button'
import { useConnectNode } from '@/contexts/connect-node.context'
import {
  useFetchContractInfo,
  useFetchNetworkIP,
  useGetActiveCode,
  useGetSmartContractAddress,
  useSubmitActiveCode
} from '@/hooks'
import { cn } from '@/lib/utils'
import { getFromClipboard } from '@metanodejs/system-core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Copy, LoaderCircle, RefreshCcw, X } from 'lucide-react'
import * as React from 'react'
import { v4 as uuidv4 } from 'uuid'

export const Route = createFileRoute('/active-code')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  const { isConnected } = useConnectNode()
  const { data: contractInfo } = useFetchContractInfo()
  const { data: ip } = useFetchNetworkIP()
  const { data: contractAddress } = useGetSmartContractAddress(contractInfo?.contractOwner)
  const { data: activeCode, refetch } = useGetActiveCode({
    contractAddress,
    ip,
    isConnected
  })

  const [refetchKey, setRefetchKey] = React.useState('')

  const { mutateAsync, isPending } = useSubmitActiveCode()

  const [passcode, setPasscode] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const hasValue = React.useMemo(() => passcode.length > 0, [passcode])

  const handleClear = React.useCallback(() => {
    setPasscode('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef.current])

  const handlePaste = React.useCallback(async () => {
    try {
      const data = (await getFromClipboard()).value
      if (!data) return
      setPasscode(data)
    } catch (error) {}
  }, [])

  React.useEffect(() => {
    if (!activeCode) return
    setPasscode(activeCode)
  }, [activeCode, refetchKey])

  const handleRefetchActiveCode = React.useCallback(async () => {
    await refetch()
    setRefetchKey(uuidv4())
  }, [])

  const handleSubmitActiveCode = React.useCallback(async () => {
    await mutateAsync({
      activeCode: passcode,
      contractAddress: contractAddress ?? ''
    })
  }, [passcode, contractAddress])

  console.log({ activeCode })

  return (
    <div
      className={cn(
        'w-full h-dvh flex flex-col px-3 overflow-hidden min-h-0',
        window.isHasNotch ? 'pt-14' : 'pt-10'
      )}
    >
      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <div className="text-center font-bold text-lg">
          <span>Please contact 3rd parties to receive the passcode. Codes are free!</span>
        </div>

        <div className="w-full h-13 bg-[#232A2C]/70 rounded-2xl relative px-3 flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full h-full tracking-[16px] font-bold placeholder:text-align leading-10 text-center outline-none bg-transparent border-none"
            maxLength={9}
            placeholder="PASSCODE"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.toUpperCase())} // optional: uppercase
          />

          {/* Icon thay đổi theo trạng thái */}
          {hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 transition-colors absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear passcode"
            >
              <X className="size-6 text-gray-400 hover:text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="p-1 rounded-full hover:bg-white/10 transition-colors absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear passcode"
            >
              <Copy className="size-6 text-gray-400" />
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2 text-blue-500 underline font-semibold"
          onClick={handleRefetchActiveCode}
        >
          <RefreshCcw className="size-5" />
          <span>Refresh</span>
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-2 text-blue-500 underline font-semibold w-full"
        onClick={() => navigate({ to: '/register' })}
      >
        <span>Register</span>
      </div>

      <div className="h-[96px] flex items-center justify-center bg-transparent flex-col gap-1">
        <Button
          type="button"
          className="h-13 w-full bg-blue-500 text-white font-bold uppercase text-lg rounded-xl border border-blue-50 z-10"
          onClick={handleSubmitActiveCode}
          disabled={isPending || !isConnected || passcode.length < 8}
        >
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : 'Next'}
        </Button>
      </div>
    </div>
  )
}
