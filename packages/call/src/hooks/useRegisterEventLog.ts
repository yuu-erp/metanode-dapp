import { withTimeout } from '~/utils'
import { useEffect, useState } from 'react'
import { useRoomStore } from '~/stores'

export type RegisterEventLog = (address: string, subscribeAddresses: string[]) => Promise<void>

export function useRegisterEventLog(registerEventLog: RegisterEventLog, meetingAddress: string) {
  const address = useRoomStore((s) => s.address)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    if (!address || !meetingAddress) return
    withTimeout(async () => {
      console.log('[DEBUG] useRegisterEventLog 1')

      await registerEventLog?.(address, [meetingAddress])
      console.log('[DEBUG] useRegisterEventLog 2')
    }).then(() => setLoad(true))
  }, [address, meetingAddress])

  return load
}
