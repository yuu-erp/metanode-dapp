'use client'

import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { formatAddress } from '@/shared/utils'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

export function EventLogProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  const [load, setLoad] = React.useState(false)

  React.useEffect(() => {
    if (!account?.address || !account.contractAddress) return

    const eventLog = container.eventLogContainer.eventLog
    const meetingAddress = CONTRACT_ADDRESSES.meeting
    const factoryAddress = CONTRACT_ADDRESSES.factory

    const array = [
      formatAddress(account.contractAddress),
      formatAddress(meetingAddress),
      formatAddress(factoryAddress),
      formatAddress(CONTRACT_ADDRESSES.file)
    ]
    eventLog.registerEvent(formatAddress(account.hiddenAddress), array)
  }, [account?.address, account?.contractAddress])

  React.useEffect(() => {
    Promise.race([
      container.eventLogContainer.registerAbi().catch(),
      new Promise((res) => setTimeout(() => res(true), 2000))
    ]).then(() => setLoad(true))
  }, [])

  return <EventLogContext.Provider value={{}}>{load ? children : null}</EventLogContext.Provider>
}

export function useEventLogContext() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
