import ButtonBase from '@/shared/components/button/button-base'
import { Input } from '@/shared/components/ui/input'
import { useCopy } from '@/shared/hooks/use-copy'
import { SHARED_QUERY_KEY } from '@/shared/lib/react-query'
import { getHiddenWallet, type Wallet } from '@metanodejs/system-core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { memo, useState } from 'react'
import { container } from '@/container'
import { toast } from 'sonner'
import { handleMessageError } from '@/shared/utils/errorNative'
import { useI18N } from '@/shared/hooks'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'

export const ApplyMeetingName = memo(() => {
  const [value, setValue] = useState('')
  const { data } = useQuery<Wallet>({
    queryKey: SHARED_QUERY_KEY.HIDDEN_ADDRESS,
    queryFn: getHiddenWallet
  })
  const search: any = useSearch({ strict: false })
  const { mutate } = useGoToMeetingView()
  const { t } = useI18N()

  const onCopy = useCopy(data?.address ?? '')

  const autoRegister = useMutation({
    mutationFn: async () => {
      if (!data) return
      if (!value) return toast.error('Name is required')

      const address = data.address

      await container.accountService.registerUser(data, value)

      mutate({
        ...search,
        address: address,
        hiddenAddress: address
      })
    },
    onError: (error) => toast.error(handleMessageError(error))
  })

  if (!data) return null

  return (
    <>
      <p>Please transfer token to address below</p>
      <p onClick={onCopy}>{data.address}</p>
      <Input
        placeholder={t('', { defaultValue: 'Enter your name' })}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-[#2c2c2e] border-white/10 text-white h-12 rounded-xl w-full"
        autoFocus
      />
      <ButtonBase isLoading={autoRegister.isPending} onClick={() => autoRegister.mutate()}>
        Connect
      </ButtonBase>
    </>
  )
})
