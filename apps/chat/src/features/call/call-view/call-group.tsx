import { cn } from '@/shared/lib'
import { useVisibleStreamKeys } from '@app/call'
import { memo } from 'react'
import { ParticipantView } from './participant-view'
import { BigShareVideo } from './big-share-video'

export const CallGroup = memo(() => {
  const { streamKeys, grid, col, row } = useVisibleStreamKeys(49)

  function getItemSpan(i: number, grid: number[], col: number) {
    let acc = 0

    for (let row = 0; row < grid.length; row++) {
      const count = grid[row]!

      if (i < acc + count) {
        return col / count
      }

      acc += count
    }

    return 1 // fallback
  }

  console.log('thanhduy - layout', { col, row, grid })

  return (
    <div className={cn('size-full overflow-hidden flex flex-col md:flex-row')}>
      <BigShareVideo />
      <div
        className="flex-1 w-full grid overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${row}, minmax(0, 1fr))`
        }}
      >
        {streamKeys.map((streamKey, i) => {
          const span = getItemSpan(i, grid, col)

          return (
            <div
              key={streamKey}
              style={{
                gridColumn: `span ${span}`
              }}
            >
              <ParticipantView streamKey={streamKey} className="size-full" />
            </div>
          )
        })}
      </div>
    </div>
  )
})
