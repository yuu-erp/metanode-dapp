import Languages from '@/components/languages'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <div
      className={cn(
        'w-full h-dvh flex flex-col px-3 overflow-hidden min-h-0',
        window.isHasNotch ? 'pt-14' : 'pt-10'
      )}
    >
      <h1 className="text-2xl font-bold">Language</h1>

      {/* Scroll area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Languages />
      </div>

      {/* Footer */}
      <div className="h-[96px] flex items-center justify-center bg-transparent">
        <Button
          className="h-13 w-full bg-white text-black/80 font-bold uppercase text-lg rounded-xl"
          onClick={() => navigate({ to: '/active-code' })}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
