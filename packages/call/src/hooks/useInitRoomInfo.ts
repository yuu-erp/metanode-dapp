import { useEffect, useState } from 'react'
import { blockchain } from '~/clients'
import { roomStore } from '~/stores'
import { formatAddress, getBooleanValue } from '~/utils'

export function useInitRoomInfo(search: any = {}, to: string) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const address = formatAddress(search?.address)
      const isMeeting = search?.callee === '0x'
      roomStore.setState({
        caller: formatAddress(search?.caller),
        callee: isMeeting ? search.callee : formatAddress(search?.callee),
        address,
        isMeet: getBooleanValue(search?.isMeet),
        isCaller: getBooleanValue(search?.isCaller),
        roomId: formatAddress(search?.roomId),
        isMeeting
      })
      blockchain.setFrom(address)
      blockchain.setTo(to)

      setReady(true)
    }

    init()
  }, [])

  return ready
}
