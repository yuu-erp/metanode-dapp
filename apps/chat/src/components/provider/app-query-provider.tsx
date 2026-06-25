// src/app/providers.tsx
import { useState, type PropsWithChildren } from 'react'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { defaultShouldDehydrateQuery, Query } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/react-query'

const persister = createSyncStoragePersister({
  storage: window.localStorage
})

function shouldPersistQuery(query: Query) {
  // giữ behavior mặc định của TanStack:
  // chỉ persist query hợp lệ/successful
  const defaultOk = defaultShouldDehydrateQuery(query)

  // chỉ persist khi meta.persist === true
  const metaPersist = query.meta?.persist === true

  return defaultOk && metaPersist
}

export function AppQueryProvider({ children }: PropsWithChildren) {
  const [isRestored, setIsRestored] = useState(false)

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
        buster: 'v1', // đổi nếu muốn bust cache sau khi đổi schema
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery
        }
      }}
      onSuccess={() => {
        setIsRestored(true)
      }}
    >
      {isRestored ? children : null}
    </PersistQueryClientProvider>
  )
}
