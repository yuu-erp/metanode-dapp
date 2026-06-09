import type { ChangeEvent } from 'react'
import { create } from 'zustand'

export type InputKey = 'chatValue'

export type InputStore = {
  chatValue: string
}

export const useInputStore = create<InputStore>()(() => ({
  chatValue: ''
}))

export function setValue(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
  key: InputKey
) {
  useInputStore.setState({ [key]: typeof e === 'string' ? e : e.target.value })
}

export function resetValue(key: InputKey) {
  useInputStore.setState({ [key]: '' })
}
