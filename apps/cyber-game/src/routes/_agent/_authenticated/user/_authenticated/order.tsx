import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/user/_authenticated/order')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_authenticated/user/_authenticated/order"!</div>
}
