import { use, useMemo } from 'react'
import { useShareStore, useUserStore } from '~/stores'
import { lcm, toStreamKey } from '~/utils'

function splitRows(n: number): number[] {
  const rows = Math.round(Math.sqrt(n))
  const base = Math.floor(n / rows)
  const extra = n % rows

  const result = Array(rows).fill(base)

  // dồn extra vào đầu
  for (let i = 0; i < extra; i++) {
    result[i]++
  }

  return result
}

export function useVisibleStreamKeys(limit = 49) {
  const shareMap = useShareStore((s) => s.shareMap)
  const activeShare = useShareStore((s) => s.activeShareUser)
  const users = useUserStore((s) => s.users)

  const streamKeys = useMemo(() => {
    const rs: string[] = []
    for (const user of users) {
      if (rs.length >= limit) break
      rs.push(toStreamKey(user, 'user'))
      if (rs.length >= limit) break
      if (shareMap[user] && user !== activeShare) rs.push(toStreamKey(user, 'display'))
    }
    return rs
  }, [shareMap, users, limit, activeShare])

  const total = streamKeys.length

  const grid = splitRows(total)
  const col = total === 0 ? 0 : lcm(grid[0]!, grid[grid.length - 1]!)
  console.log('activeShare', activeShare)
  console.log('streamKeys', streamKeys)

  return { streamKeys, row: grid.length, col, grid }
}
