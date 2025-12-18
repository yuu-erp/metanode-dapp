'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Drawer, DrawerContent } from './ui/drawer'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getAvatarFallback } from '../utils'

interface DrawerEnterPasswordProps {
  open: boolean
  onClose: () => void
  onSubmit: (password: string) => Promise<void>
  avatarURL?: string
  name?: string
}

interface FormValues {
  password: string
}

function DrawerEnterPassword({
  open,
  onClose,
  onSubmit,
  avatarURL,
  name
}: DrawerEnterPasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<FormValues>()

  const handleLogin = async (data: FormValues) => {
    try {
      await onSubmit(data.password)
      reset()
      onClose()
    } catch (err: any) {
      setError('password', {
        type: 'server',
        message: err?.message || 'Login failed'
      })
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="px-5 pb-5 bg-white/50">
        <div className="flex flex-col items-center justify-center gap-3 pt-3">
          <Avatar className="h-20 w-20 rounded-full">
            <AvatarImage src={avatarURL} alt={name} />
            <AvatarFallback className="rounded-lg">{getAvatarFallback(name)}</AvatarFallback>
          </Avatar>
          <div className="text-center font-bold text-black/60 text-xl">{name}</div>
        </div>
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-black/60 font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-white border-px border-black/60 text-black/60"
              autoFocus
              placeholder="Enter password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Minimum 6 characters'
                }
              })}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-white text-black/60 font-bold text-md uppercase"
            disabled={isSubmitting}
          >
            Login
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(DrawerEnterPassword)
