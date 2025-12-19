'use client'

import { FormProvider, useForm } from 'react-hook-form'
import React from 'react'

export type CreateProfileFormValues = {
  name?: string
  age?: number
  avatar?: string
}

export function CreateProfileFormProvider({ children }: { children: React.ReactNode }) {
  const methods = useForm<CreateProfileFormValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      avatar: ''
    }
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}
