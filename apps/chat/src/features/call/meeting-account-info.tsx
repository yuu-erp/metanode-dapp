import type { Account } from '@/modules/account'
import ButtonBase from '@/shared/components/button/button-base'
import type { RequireMeetingData } from '@/shared/hooks/call/use-create-meeting'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useSearch } from '@tanstack/react-router'
import { memo } from 'react'

export type MeetingAccountInfoProps = {
  account: Account
}

export const MeetingAccountInfo = memo(({ account }: MeetingAccountInfoProps) => {
  const { mutate } = useGoToMeetingView()
  const search: RequireMeetingData = useSearch({ strict: false })

  const onClick = async () => {
    mutate({
      ...search,
      address: account.address
    })
  }

  return (
    <>
      <p>{account?.name}</p>
      <p className="line-clamp-1">{account?.address}</p>
      <ButtonBase onClick={onClick}>Connect</ButtonBase>
    </>
  )
})
