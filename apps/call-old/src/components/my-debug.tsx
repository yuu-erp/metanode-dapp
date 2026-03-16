import { useEventBus } from '@/hooks'
import { callContext } from '@/modules'
import { memo, useState } from 'react'

export const MyDebug = memo(() => {
  const [localStep, setLocalStep] = useState('ide')
  const [contextData, setContextData] = useState(callContext.getState())
  const [connectionStatus, setConnectionStatus] = useState({})

  useEventBus('connect-local', setLocalStep)
  useEventBus('context.update', setContextData)
  useEventBus('local.pc.state', setConnectionStatus)

  return (
    <div className="absolute top-20 left-5 text-white">
      <div className="p-2 border">
        <p className="font-bold">Status</p>
        <p>{`Local step: ${localStep}`}</p>

        {Object.entries(connectionStatus).map(([key, value]: any[]) => (
          <div className="flex flex-row gap-1 text-sm" key={key}>
            <p className="font-bold">{key}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>

      <div className="p-2 border">
        <p className="font-bold">Context</p>
        {Object.entries(contextData).map(([key, value]: any[]) => (
          <div className="flex flex-row gap-1 text-sm" key={key}>
            <p className="font-bold">{key}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
})
