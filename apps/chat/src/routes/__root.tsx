import { container } from '@/container'
import { EventLogProvider } from '@/contexts'
import { BaseLayout } from '@/shared/layouts'
import { createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => {
    useEffect(() => {
      const off = container.eventLogContainer.eventLog.onEventLog((data) => {
        console.log('thanhduy - eventlog data', data)
      })
      return () => {
        off()
      }
    }, [])

    return (
      <>
        {/* <button
          className="fixed z-50 left-5 top-5 size-20 bg-black"
          onClick={async () => {
            try {
              console.log('click')

              const rootWallet = 'cf47697bae5c7da470ae3d6f7cb5aeee48f4d61e' //tablet
              // const rootWallet = 'e344be071d8102fb5b3c41d253ab79e9a1a9c201' //phone

              // const newAddress = (await createWalletFast(true)).address
              const newAddress = '9faf2fc357d5623c2f4e70d87f524035b42d08db'
              // console.log('thanhduy - newAddress 1')

              // const newAddress = (await getHiddenWallet()).address
              console.log('thanhduy - newAddress 2', newAddress)
              await sendTransaction({ from: rootWallet, to: newAddress, value: 1 + '0'.repeat(14) })
              toast.success('create success')
            } catch (error) {
              console.error(' send transaction error ', error)
            }
          }}
        ></button> */}
        <EventLogProvider>
          <BaseLayout />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              classNames: { toast: window.isHasNotch ? 'mt-12' : 'mt-8' },
              style: {
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          />
        </EventLogProvider>
      </>
    )
  }
})
