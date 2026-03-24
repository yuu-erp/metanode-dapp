import { CallContainer } from '@/features/call-view/call-container'
import { ReloadCallDialog } from '@/features/call-view/reload-call-dialog'
import { callStore } from '@/modules/call'
import { formatAddress } from '@/shared/utils'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'

export const Route = createFileRoute('/call')({
  component: RouteComponent
})

function RouteComponent() {
  const [loading, setLoading] = useState(true)
  const search: any = useSearch({ strict: false })

  const getBooleanValue = useCallback((v: string | boolean) => {
    if (typeof v === 'boolean') return v
    if (v.startsWith('true')) return true
    if (v.startsWith('false')) return false
    return false
  }, [])

  useEffect(() => {
    callStore.setState({
      caller: formatAddress(search?.caller),
      callee: formatAddress(search?.callee),
      address: formatAddress(search?.address),
      isMeet: getBooleanValue(search?.isMeet),
      isCaller: getBooleanValue(search?.isCaller),
      roomId: formatAddress(search?.roomId),
      hiddenAddress: formatAddress(search?.hiddenAddress)
    })
    setLoading(false)
  }, [])

  return (
    <>
      {loading ? null : <CallContainer />}
      <ReloadCallDialog />
    </>
  )
}
