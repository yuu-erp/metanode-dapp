import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/owner/_authenticated/system')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_authenticated/owner/_authenticated/system"!</div>
}
