import ButtonBase from '@/shared/components/button/button-base'
import { useI18N } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import { memo, useEffect, useRef, useState } from 'react'
import { Modal } from './modal'
import { useModalStore } from './modal.store'

export const MeetingJoinByUrlModal = memo(() => {
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const open = useModalStore((s) => s.joinMeeting)
  const { t } = useI18N()
  const ref = useRef<HTMLInputElement>(null)

  const onSubmit = () => {
    const queryString = value.split('?')[1]
    // parse
    const params = new URLSearchParams(queryString)

    // convert sang object
    const search = Object.fromEntries(params.entries())
    navigate({ to: '/setup-meeting', search })

    useModalStore.setState({ joinMeeting: false })
  }

  useEffect(() => {
    if (!open) return
    setValue('')
    setTimeout(() => {
      ref.current?.focus()
    }, 0)
  }, [open])

  return (
    <Modal
      open={open}
      onOpenChange={(v) => useModalStore.setState({ joinMeeting: v })}
      content={
        <div className="flex flex-col items-center p-3 gap-3 overflow-hidden">
          <p>Tham gia cuộc họp</p>
          <input
            // onBlur={() => ref.current?.focus()}
            ref={ref}
            placeholder={t('', { defaultValue: 'Enter link' })}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-[#2c2c2e] border-white/10 text-white h-12 rounded-xl w-full px-3"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              onSubmit()
            }}
          />
          <ButtonBase onClick={onSubmit}>Join</ButtonBase>
        </div>
      }
    />
  )
})
