import { useCallback, useState } from 'react'
import { getCallback, useEventLog } from '~/clients'
import { roomActions, roomStore } from '~/stores'
import { decodeBase64 } from '~/utils'

type ReactionItem = {
  id: number
  emoji: string
  left: number
  name: string
}

let idCounter = 0

export function useCallReactions() {
  const [reactions, setReactions] = useState<ReactionItem[]>([])

  const addReaction = useCallback((emoji: string, name: string) => {
    const id = idCounter++

    const newItem: ReactionItem = {
      id,
      emoji,
      left: Math.random() * 80 + 10, // tránh sát mép (10% -> 90%)
      name
    }

    setReactions((prev) => [...prev, newItem])

    // remove sau 3s
    setTimeout(() => {
      setReactions((prev) => prev.filter((item) => item.id !== id))
    }, 3000)
  }, [])

  useEventLog(
    'CallReactionSent',
    async (e) => {
      const { address } = roomStore.getState()
      const isEventOwnedByMe = roomActions.isEventOwnedByMe(e, e.sender)
      const name = isEventOwnedByMe
        ? 'You'
        : await getCallback('fetchNameByUser')(address, e.sender)
      addReaction(decodeBase64(e.reaction), name)
    },
    roomActions.isMyRoom
  )

  return reactions
}
