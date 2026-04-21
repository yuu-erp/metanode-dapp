'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Drawer, DrawerContent } from './ui/drawer'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

interface DrawerDeleteProfileProps {
  open: boolean
  onClose: () => void
  onSubmit?: (value: string) => void | Promise<void>
}

interface FormValues {
  value: string
}

function DrawerDeleteProfile({ open, onClose, onSubmit }: DrawerDeleteProfileProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    mode: 'onSubmit'
  })

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit?.(data.value)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleClose()}>
      <DrawerContent className="px-5 bg-white/50 pb-10">
        <form className="space-y-4 pt-3" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-black/60 font-bold pb-2">
              Type 'delete' to erase your current profile
            </Label>
            <Input
              id="value"
              autoFocus
              placeholder="Type delete to confirm"
              className="bg-white border-px border-black/60 text-black/60 rounded-xl"
              {...register('value', {
                required: 'This field is required',
                validate: (v) => v === 'delete' || 'You must type "delete"'
              })}
            />
            {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-white text-black/60 font-bold text-md uppercase rounded-xl"
          >
            Delete
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default React.memo(DrawerDeleteProfile)
