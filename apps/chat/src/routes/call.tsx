import { CallContainer } from '@/features/call-view/call-container'
import { callContext } from '@/modules'
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
    callContext.setState({
      caller: search?.caller ?? '',
      callee: search?.callee ?? '',
      address: search?.address ?? '',
      isMeet: getBooleanValue(search?.isMeet),
      isCaller: getBooleanValue(search?.isCaller),
      roomId: search?.roomId ?? '',
      hiddenAddress: search?.hiddenAddress ?? ''
    })
    setLoading(false)
  }, [])

  return <>{loading ? null : <CallContainer />}</>
}
