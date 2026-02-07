'use client'
import * as React from 'react'
import { useAgentContracts } from '@/shared/hooks/use-agent-contracts'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/agent-not-found')({
  component: AgentNotFound
})

function AgentNotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refetch } = useAgentContracts('cyberyuu.fi.ai')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRetry = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // const result = await refetch()
      // if (result.data && result.data.agentInfo && result.data.meosAddresses) {
      //     navigate({ to: "/" })
      // }
      navigate({ to: '/' })
    } finally {
      setIsLoading(false)
    }
  }, [refetch, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-black/60 backdrop-blur-lg-app p-8 rounded-4xl shadow-md max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-100">{t('agent:notFound.title')}</h1>

        <p className="text-gray-300">{t('agent:notFound.description')}</p>

        <ul className="text-sm text-gray-300 text-left list-disc pl-5 space-y-2">
          <li>{t('agent:notFound.reasons.notRegistered')}</li>
          <li>{t('agent:notFound.reasons.corrupted')}</li>
          <li>{t('agent:notFound.reasons.network')}</li>
        </ul>

        <div className="pt-4">
          <Button
            onClick={handleRetry}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('agent:notFound.pleaseWait')}
              </>
            ) : (
              t('agent:notFound.tryAgain')
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
