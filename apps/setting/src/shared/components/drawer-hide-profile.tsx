'use client'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Drawer, DrawerContent } from './ui/drawer'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getAvatarFallback } from '../utils'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useI18N } from '../hooks'

type FormValues = {
  password?: string
  confirmPassword?: string
  username?: string
}

interface DrawerHideProfileProps {
  open: boolean
  onClose: () => void
  avatarURL?: string
  name?: string
  isPassowrd?: boolean
  onSubmit?: (value: { password?: string; username: string }) => Promise<void>
}

function DrawerHideProfile({
  open,
  onClose,
  avatarURL,
  name,
  isPassowrd = false,
  onSubmit
}: DrawerHideProfileProps) {
  const { t } = useI18N()
  const [step, setStep] = React.useState(isPassowrd ? 1 : 0)

  // 🔑 lưu password ngoài react-hook-form lifecycle
  const passwordRef = React.useRef<string | undefined>(undefined)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError
  } = useForm<FormValues>({
    mode: 'onSubmit',
    shouldUnregister: true
  })

  const password = watch('password')

  const handleFormSubmit = React.useCallback(async (data: FormValues) => {
    try {
      // chỉ có username
      if (isPassowrd) {
        await onSubmit?.({
          username: data.username!
        })
        handleClose()
        return
      }

      // có password
      if (step === 0) {
        passwordRef.current = data.password
        setStep(1)
        return
      }

      await onSubmit?.({
        password: passwordRef.current,
        username: data.username!
      })

      handleClose()
    } catch (err: any) {
      console.error(err)
      setError('username', {
        type: 'server',
        message: err?.message || 'Login failed'
      })
    }
  }, [])

  const handleClose = React.useCallback(() => {
    reset()
    passwordRef.current = undefined
    setStep(isPassowrd ? 1 : 0)
    onClose()
  }, [reset, isPassowrd, onClose])

  React.useEffect(() => {
    setStep(isPassowrd ? 1 : 0)
  }, [isPassowrd])

  // Fix vấn đề height bị lock khi keyboard đóng (hỗ trợ cả iOS & Android)
  React.useEffect(() => {
    if (!open) return
    let lastHeight = window.innerHeight
    let lastVisualViewportHeight = window.visualViewport?.height || window.innerHeight

    const resetDrawerHeight = () => {
      const drawerContent = document.querySelector(
        '[data-vaul-drawer][role="dialog"]'
      ) as HTMLElement

      if (!drawerContent) {
        return
      }

      // XÓA inline height và bottom để về className mặc định
      drawerContent.style.removeProperty('height')
      drawerContent.style.removeProperty('bottom')

      // Force reflow để re-calculate layout
      void drawerContent.offsetHeight

      // Trigger re-layout cho SectionContainer
      const sectionContainer = drawerContent.querySelector('.container')
      if (sectionContainer) {
        void (sectionContainer as HTMLElement).offsetHeight
      }
    }

    const handleWindowResize = () => {
      const currentWindowHeight = window.innerHeight
      const drawerContent = document.querySelector(
        '[data-vaul-drawer][role="dialog"]'
      ) as HTMLElement

      if (!drawerContent) return

      const currentInlineHeight = drawerContent.style.height

      // Keyboard đang đóng (window height tăng lên)
      if (currentWindowHeight > lastHeight && currentInlineHeight) {
        setTimeout(resetDrawerHeight, 100)
      }

      lastHeight = currentWindowHeight
    }

    // Handler cho iOS (dùng visualViewport)
    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return
      const currentVisualHeight = window.visualViewport.height
      const visualViewportOffsetTop = window.visualViewport.offsetTop
      const drawerContent = document.querySelector(
        '[data-vaul-drawer][role="dialog"]'
      ) as HTMLElement

      if (!drawerContent) return

      const currentInlineHeight = drawerContent.style.height

      if (currentVisualHeight < lastVisualViewportHeight) {
        if (visualViewportOffsetTop > 0) {
          drawerContent.style.bottom = '0px'
        }
      }

      if (currentVisualHeight > lastVisualViewportHeight && currentInlineHeight) {
        setTimeout(resetDrawerHeight, 150)
      }

      lastVisualViewportHeight = currentVisualHeight
    }

    const handleVisualViewportScroll = () => {
      if (!window.visualViewport) return

      const visualViewportOffsetTop = window.visualViewport.offsetTop
      const drawerContent = document.querySelector(
        '[data-vaul-drawer][role="dialog"]'
      ) as HTMLElement

      if (!drawerContent) return

      if (visualViewportOffsetTop > 0) {
        drawerContent.style.bottom = '0px'
      }
    }

    window.addEventListener('resize', handleWindowResize)

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize)
      window.visualViewport.addEventListener('scroll', handleVisualViewportScroll)
    }

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
        window.visualViewport.removeEventListener('scroll', handleVisualViewportScroll)
      }
    }
  }, [open])

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DrawerContent className="px-5 pb-10 bg-white/50 ios:fixed ios:bottom-0 ios:transform-none">
        <div className="flex flex-col items-center gap-3 pt-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarURL} alt={name} />
            <AvatarFallback className="rounded-full text-black/60 font-bold text-2xl">
              {getAvatarFallback(name)}
            </AvatarFallback>
          </Avatar>
          <div className="font-bold text-black/60 text-xl">{name}</div>
        </div>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>{t('label.password')}</Label>
                <Input
                  type="password"
                  placeholder={t('label.password')}
                  className="bg-white border-px border-black/60 text-black/60 rounded-xl"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('label.confirmPassword')}</Label>
                <Input
                  type="password"
                  placeholder={t('label.confirmPassword')}
                  className="bg-white border-px border-black/60 text-black/60 rounded-xl"
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (v) => v === password || 'Password does not match'
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>{t('label.username')}</Label>
              <Input
                autoFocus
                placeholder={t('label.username')}
                className="bg-white border-px border-black/60 text-black/60 rounded-xl"
                {...register('username', {
                  required: 'Username is required'
                })}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-white text-black/60 font-bold uppercase rounded-xl"
          >
            {step === 0 ? t('btn.continue') : t('btn.hideContent')}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(DrawerHideProfile)
