import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/owner/_authenticated/general')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_authenticated/owner/_authenticated/general"!</div>
}
