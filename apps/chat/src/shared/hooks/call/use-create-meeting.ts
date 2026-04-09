import { useModalStore } from '@/features/modal'
import type { Account } from '@/modules/account'
import type { ConversationType } from '@/modules/conversation'
import { useNavigate } from '@tanstack/react-router'

export type RequireMeetingData = {
  caller: string
  callee: string
  isMeet: boolean
  isCaller: boolean
  conversationType: ConversationType
  roomId: string
}

export function useCreateMeeting(account?: Account, onClose?: Function) {
  const navigate = useNavigate()

  const getMeetingData = () => {
    if (!account) throw new Error()
    const callee = '0x'
    return {
      caller: account.address,
      callee,
      isMeet: true,
      conversationType: 'group'
    } as RequireMeetingData
  }

  const onGoMeeting = () => {
    if (!account) return
    onClose?.()
    navigate({
      to: '/call',
      search: {
        ...getMeetingData(),
        address: account.address,
        hiddenAddress: account.hiddenAddress,
        isCaller: true
      }
    })
  }

  const onJoinLink = () => {
    onClose?.()
    useModalStore.setState({ joinMeeting: true })
  }

  return { onGoMeeting, onJoinLink }
}
