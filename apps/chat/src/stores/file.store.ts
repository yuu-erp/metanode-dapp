import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface FileMeta {
  path: string
  fileName: string
  extension: string
  mimeType: string
  size: number
  createdAt: number
  displaySize: string
}

export type FileItem = {
  meta: FileMeta
  file?: File | Blob
  path?: string
}

export type FileStore = {
  files: Record<string, Blob>
  map: Record<string, FileItem>
  updateFileByid: (id: string, input: Partial<FileItem>) => void
  deleteFileById: (id) => void
  items: FileItem[]
  reset: () => void
  addItem: (item: FileItem | FileItem[]) => void
  removeItem: (idx: number) => void
}

export const useFileStore = create<FileStore>()(
  immer((set, get) => ({
    map: {},
    files: {},
    items: [],
    deleteFileById: (id) => {
      set((s) => {
        delete s.map[id]
      })
    },
    updateFileByid: (id, data) =>
      set((s) => {
        s.map[id] = { ...s.map[id], ...data }
      }),
    reset: () => set({ items: [] }),
    addItem: (item) => {
      const input = Array.isArray(item) ? item : [item]
      set({ items: [...get().items, ...input] })
    },
    removeItem: (idx) => set({ items: get().items.filter((_, i) => i !== idx) })
  }))
)

export const fileActions = useFileStore.getState()
