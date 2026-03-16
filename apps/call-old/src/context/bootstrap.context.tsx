import { CONTRACT_ADDRESSES } from '@/config'
import { callContext, eventLog } from '@/modules'
import { ensurePermissionGranted, getHiddenWallet } from '@metanodejs/system-core'
import { useSearch } from '@tanstack/react-router'
import { createContext, useCallback, useEffect, useState, type PropsWithChildren } from 'react'

export type BoostrapContext = {}

export const BoostrapContext = createContext<BoostrapContext>(null!)

export const BoostrapProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    callContext.setState({
      caller: search?.caller ?? '',
      callee: search?.callee ?? '',
      address: search?.address ?? '',
      isMeet: getBooleanValue(search?.isMeet),
      isCaller: getBooleanValue(search?.isCaller),
      roomId: search?.roomId ?? ''
    })

    const register = async () => {
      await ensurePermissionGranted('micro')

      await Promise.all([
        eventLog.eventLog.registerEvent(callContext.address, [CONTRACT_ADDRESSES.meeting]).catch(),
        eventLog.registerAbi().catch(),
        ensurePermissionGranted('camera')
      ])
    }

    const handleRegister = async () => {
      await Promise.race([
        register(),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve()
          }, 2000)
        )
      ])

      const hiddenAddress = (await getHiddenWallet()).address
      callContext.setState({ hiddenAddress })
      setLoading(false)
    }

    handleRegister()
  }, [])

  return (
    <BoostrapContext.Provider value={{}}>
      {loading ? 'Loading bootstrap...' : children}
    </BoostrapContext.Provider>
  )
}
