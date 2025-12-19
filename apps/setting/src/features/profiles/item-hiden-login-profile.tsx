'use client'
import type { Profile } from '@/interfaces'
import ItemProfile from '@/shared/components/item-profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/shared/components/ui/drawer'
import { Input } from '@/shared/components/ui/input'
import { useGetAllProfile, useI18N, useLoginProfile } from '@/shared/hooks'
import { getAvatarFallback, isVisibleProfile } from '@/shared/utils'
import { HatGlasses } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'

interface FormValues {
  username?: string
  password?: string
}

function ItemHidenLoginProfile() {
  const { t } = useI18N()
  const [step, setStep] = React.useState<0 | 1>(0)

  const [profile, setProfile] = React.useState<Profile | null>(null)

  const { data: profiles = [] } = useGetAllProfile()

  const { loginAsync } = useLoginProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError
  } = useForm<FormValues>({
    mode: 'onSubmit'
  })

  const onSubmit = React.useCallback(
    async (data: FormValues) => {
      try {
        if (step === 0) {
          console.log({ profiles, data })
          const profileExist = profiles.find(
            (item) => item.userName === data.username && !isVisibleProfile(item) // chỉ cho hidden profile
          )
          console.log({ profileExist })
          if (!profileExist) {
            setError('username', {
              type: 'manual',
              message: 'Hidden profile not found'
            })
            return
          }

          // ✅ đúng hidden profile
          setProfile(profileExist)
          setStep(1)
          return
        }

        if (step === 1) {
          // TODO: login với password
          if (!profile) throw new Error('Profile not found')
          if (!data.password) throw new Error('Please enter password')
          await loginAsync({ id: profile?.id, password: data.password })
        }
      } catch {
        setError('username', {
          type: 'manual',
          message: 'Something went wrong. Please try again.'
        })
      }
    },
    [step, profiles, profile, setError]
  )

  const handleClose = () => {
    reset()
    setProfile(null)
    setStep(0)
  }

  return (
    <Drawer onOpenChange={(v) => !v && handleClose()}>
      <DrawerTrigger asChild>
        <ItemProfile
          AvatarIcon={HatGlasses}
          name={t('loginWithHiddenProfile')}
          className="background-card h-16 rounded-2xl"
        />
      </DrawerTrigger>
      <DrawerContent className="px-5 bg-white/50 pb-10">
        <div className="flex flex-col items-center justify-center gap-3 pt-3">
          {profile ? (
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="rounded-full text-black/60 font-bold">
                {getAvatarFallback(profile.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-20 w-20 flex items-center justify-center bg-white rounded-full">
              <HatGlasses className="size-10 text-black/60" />
            </div>
          )}
          <div className="text-center font-bold text-black/60 text-xl">
            {profile && profile.name ? profile.name : t('loginWithHiddenProfile')}
          </div>
        </div>
        <form className="space-y-4 pt-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            {step === 0 && (
              <Input
                type="text"
                className="bg-white border-px border-black/60 text-black/60 rounded-xl"
                autoFocus
                placeholder={t('label.enterUsername')}
                {...register('username', {
                  required: 'Username is required'
                })}
              />
            )}
            {step === 1 && (
              <Input
                type="password"
                className="bg-white border-px border-black/60 text-black/60 rounded-xl"
                autoFocus
                placeholder={t('enterPassword')}
                {...register('password', {
                  required: 'Password is required'
                })}
              />
            )}
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-white text-black/60 font-bold text-md uppercase rounded-xl"
            disabled={isSubmitting}
          >
            {t('btn.login')}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(ItemHidenLoginProfile)
