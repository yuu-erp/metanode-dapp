import { QueryClient } from '@tanstack/react-query'
import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import type { EventMap } from '@/contract/types'

export const queryClient = new QueryClient()

export const queryKeys = {
  wallet: {
    all: ['allWallets']
  },
  admin: {
    allUsers: ['allUsers'],
    allAdmin: ['allAdmin'],
    userContract: (address: string) => ['userContract', address],
    userInfo: (contractAddress: string) => ['userInfo', contractAddress],
    isUserDisabled: (address: string) => ['isUserDisabled', address],
    adminExecutorAppointedAt: (address: string) => ['adminExecutorAppointedAt', address],
    userDisabledAt: (address: string) => ['userDisabledAt', address],
    userRegisteredAt: (address: string) => ['userRegisteredAt', address]
  }
}

export const decodeAbi = new DecodeAbi()
export const eventLog = new EventLog<EventMap>(decodeAbi)
