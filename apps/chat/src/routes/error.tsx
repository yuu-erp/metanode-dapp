import { createFileRoute, useSearch } from '@tanstack/react-router'

export const Route = createFileRoute('/error')({
  component: RouteComponent
})

function RouteComponent() {
  const search: any = useSearch({ strict: false })

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-5">
      <p className="text-4xl">Error</p>
      <p>{search.message}</p>
    </div>
  )
}
