import { useCallback } from 'react'
import { UserSource } from '~/@types'
import { callActions, callStore, mediaStore, useCallStore } from '~/stores'

export function useToggleSourceEnabled(source: UserSource) {
  const enabled = useCallStore((s) => s.enabled[source])

  const onClick = useCallback(async () => {
    const { enabled, allowed } = callStore.getState()
    const newValue = !enabled[source]
    if (newValue && !allowed[source]) throw new Error(`Permission ${source} denied`)
    const { localTracks } = mediaStore.getState()
    const track = localTracks[source]
    if (track) track.enabled = newValue
    callActions.toggleEnabled(source, newValue)
  }, [source])

  return { enabled, onClick }
}
