import { useEffect, useState } from 'react'
import { blockchain } from '~/clients'
import { roomStore } from '~/stores'
import { formatAddress, getBooleanValue } from '~/utils'

export function useInitRoomInfo(search: any = {}, to: string) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      console.log('[DEBUG] useInitRoomInfo 1', search)
      const address = formatAddress(search?.address)
      const hiddenAddress = formatAddress(search?.hiddenAddress)

      const isMeeting = search?.callee === '0x'
      roomStore.setState({
        caller: formatAddress(search?.caller),
        callee: isMeeting ? search.callee : formatAddress(search?.callee),
        address,
        isMeet: getBooleanValue(search?.isMeet),
        isCaller: getBooleanValue(search?.isCaller),
        roomId: formatAddress(search?.roomId),
        isMeeting,
        hiddenAddress: hiddenAddress
      })

      console.log('[DEBUG] useInitRoomInfo 2', roomStore.getState())
      blockchain.setFrom(hiddenAddress)
      blockchain.setTo(to)

      setReady(true)
    }

    init()
  }, [])

  return ready
}
