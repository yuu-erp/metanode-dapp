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
      await registerEventLog(address, [meetingAddress])
    }).then(() => setLoad(true))
  }, [address, meetingAddress])

  return load
}
