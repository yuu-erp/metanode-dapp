import { container } from '@/container'
import { Input } from '@/shared/components/ui/input'
import { useCurrentAccount, useI18N } from '@/shared/hooks'
import { useGetUserProfile } from '@/shared/hooks/accounts'
import { handleMessageError } from '@/shared/utils/errorNative'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Drawer } from 'vaul'
import ButtonBase from '../../button/button-base'
import ConversationContact from '../../conversation-contact'
import { ScreenType } from '../drawer-new-conversation'
import { HeaderSection } from '../sections'

export type NewContactProps = {
  onChangeScreenType: (type: ScreenType) => void
  onClose?: () => void
}

export const NewContact = ({ onChangeScreenType, onClose }: NewContactProps) => {
  const { t } = useI18N()
  const { data: acccount } = useCurrentAccount()
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const {
    data: contractAddress,
    isPending,
    mutate
  } = useMutation({
    mutationFn: async () => {
      return await container.factoryContract.getUserContract({
        from: acccount?.address!,
        inputData: { user: value }
      })
    },
    onError: (errror) => {
      toast.error('Get user contract address failed: ' + handleMessageError(errror))
    }
  })

  const { data } = useGetUserProfile(contractAddress)

  return (
    <>
      <HeaderSection>
        <div className="w-full h-full flex items-center justify-center">
          <button
            className="absolute left-4 size-10 rounded-full border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80 btn"
            onClick={() => onChangeScreenType(ScreenType.DEFAULT)}
          >
            <ChevronLeftIcon className="size-5 " />
          </button>
          <div className="flex flex-col items-center">
            <Drawer.Title className=" font-semibold text-lg text-black">
              {t('drawer.newContact', { defaultValue: 'New Contact' })}
            </Drawer.Title>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 px-4 w-full">
          <div className="w-full">
            <Input
              type="text"
              placeholder={t('search.typeUserAddress', {
                defaultValue: 'Type user address...'
              })}
              className="flex-1 h-12 rounded-full px-4 text-sm  placeholder:text-gray-300 border border-white/10 outline-none transition bg-white text-black/80"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') mutate()
              }}
            />
          </div>
          <ButtonBase
            variant="submit"
            disabled={isPending}
            onClick={() => mutate()}
            className="btn"
          >
            {isPending
              ? 'Loading...'
              : t('search.search', {
                  defaultValue: 'Search'
                })}
          </ButtonBase>

          <div className="w-full">
            {data && (
              <ConversationContact
                name={`${data.lastName} ${data.firstName}`}
                username={data.userName}
                type={'p2p'}
                onClick={() => {
                  if (!contractAddress) return
                  onClose?.()
                  navigate({
                    to: '/$type/$id',
                    params: { id: contractAddress, type: 'p2p' }
                  })
                }}
              />
            )}
          </div>
        </div>
      </HeaderSection>
    </>
  )
}
