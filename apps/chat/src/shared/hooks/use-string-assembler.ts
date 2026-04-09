import { useRef } from 'react'

export function useStringAssembler() {
  const map = useRef(new Map<string, string[]>())

  return (id: string, string: string, index: number, total: number) => {
    let array = map.current.get(id)
    if (!array) {
      array = []
      map.current.set(id, array)
    }
    array[index] = string

    if (array.filter(Boolean).length === total) {
      const rs = array.join('')
      map.current.delete(id)
      return rs
    }
    return null
  }
}
