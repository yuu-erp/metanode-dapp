import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
// import { createAgentContractsQuery } from '@/shared/hooks/use-agent-contracts'
// import { queryClient } from '@/shared/lib/react-query'

export const Route = createFileRoute('/_agent')({
  beforeLoad: async () => {
    // const domain = "cyberyuu.fi.ai"
    // try {
    //     const { agentInfo, meosAddresses } = await queryClient.ensureQueryData(createAgentContractsQuery(domain))
    //     if (!agentInfo || !meosAddresses) {
    //         throw redirect({
    //             to: "/agent-not-found",
    //         })
    //     }
    //     return { agentInfo, meosAddresses }
    // } catch (error) {
    //     throw redirect({
    //         to: "/agent-not-found",
    //     })
    // }
  },
  component: Outlet,
  pendingComponent: () => {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-black/50">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    )
  }
})
