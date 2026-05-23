import { endCall } from '@metanodejs/system-core'
import { blockchain, getCallback, onLogError } from '~/clients'
import { callStore, roomStore, statusActions, useStatusStore, useUserStore } from '~/stores'

let ready = true
export function setReady(input: boolean) {
  ready = input
}

function setEnding(ending: boolean) {
  callStore.setState({ ending })
}

export async function enCallAndCloseView() {
  try {
    if (!ready) return
    ready = false
    const { ending } = callStore.getState()
    console.log('[enCallAndCloseView] ending', ending)
    if (ending) return
    setEnding(true)
    const users = useUserStore.getState().users
    if (users.length === 1) {
      statusActions.setStatus('cancelled')
    }

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
      if (location.hash.startsWith('#/call')) {
        getCallback('onEndCall')()
      }
    } else {
      await endCall()
    }
    setEnding(false)
  }
}
