import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/profile/$id')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_layout/profile/$id"!</div>
}
