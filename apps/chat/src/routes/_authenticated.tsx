import {
  createCheckUserContractQueryOptions,
  createCurrentAccountQueryOptions
} from '@/shared/hooks'
import { queryClient } from '@/shared/lib/react-query'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  loader: async () => {
    try {
      const currentAccount = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())
      console.log({ currentAccount })
      if (!currentAccount) throw redirect({ to: '/wallets' })
      const checkUserContract = await queryClient.ensureQueryData(
        createCheckUserContractQueryOptions(currentAccount.address)
      )
      console.log({ checkUserContract })
      if (!checkUserContract) throw redirect({ to: '/wallets' })
      return {}
    } catch (error) {
      throw redirect({ to: '/wallets' })
    }
  },
  component: Outlet
})
