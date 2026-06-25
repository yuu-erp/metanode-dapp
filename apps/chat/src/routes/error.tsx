import { usePlatform } from '@/hooks/core/use-platform'
import { Button } from '@/shared/components/ui/button'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/error')({
  component: RouteComponent
})

function RouteComponent() {
  const search: any = useSearch({ strict: false })
  const { isNotWeb } = usePlatform()
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-5 relative">
      {isNotWeb && (
        <Button
          variant={'ghost'}
          className="absolute z-50 left-0 top-8"
          onClick={() => {
            navigate({ to: '/' })
          }}
        >
          <ChevronLeft />
          Back
        </Button>
      )}
      <p className="text-4xl">Error</p>
      <p>{search.message}</p>
    </div>
  )
}
