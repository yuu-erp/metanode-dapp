import { endCall } from '@metanodejs/system-core'
import { blockchain, getCallback, onLogError } from '~/clients'
import { callStore, roomStore } from '~/stores'

function setEnding(ending: boolean) {
  callStore.setState({ ending })
}

export async function enCallAndCloseView() {
  try {
    const { ending } = callStore.getState()
    if (ending) return
    setEnding(true)
    const { isMeet, callee, caller, isCaller, roomId, address } = roomStore.getState()
    const conversationId = isMeet ? callee : isCaller ? callee : caller

    await blockchain.leaveRoom({
      end: true,
      meet: isMeet,
      otherParty: conversationId,
      sender: address,
      roomId,
      owner: address
    })
  } catch (error) {
    onLogError(error)
  } finally {
    if (window.finSdk) {
      if (location.hash === '#/call') {
        getCallback('onEndCall')()
      }
    } else {
      await endCall()
    }
    setEnding(false)
  }
}
