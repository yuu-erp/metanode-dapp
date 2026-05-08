import { usePlatform } from '@/hooks/core/use-platform'
import { cn } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { memo, type ButtonHTMLAttributes } from 'react'
import { iconSvgs } from './svg'

export type WindowButtonsProps = {}

export const WindowButtons = memo(({}: WindowButtonsProps) => {
  const buttons: (ButtonHTMLAttributes<HTMLButtonElement> & { path: string; command: string })[] = [
    {
      path: iconSvgs.minimize,
      command: 'minimizeWindow'
    },
    {
      path: iconSvgs.maximize,
      command: 'maximizeWindow'
    },
    {
      path: iconSvgs.close,
      command: 'closeWindow'
    }
  ]

  const { isWindow } = usePlatform()

  if (!isWindow) return null

  return (
    <div className={cn('flex gap-1 absolute right-3 top-3 z-100')}>
      {buttons.map(({ path, command, ...btn }, i) => (
        <button
          key={i}
          {...btn}
          className={cn(
            'rounded-full border-app size-5 flex items-center justify-center',
            btn.className
          )}
          onClick={() => sendCommand(command)}
        >
          <img alt="" src={path} className="size-2.5" />
        </button>
      ))}
    </div>
  )
})
