import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/manager/_authenticated/loyalty')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_authenticated/manager/_authenticated/loyalty"!</div>
}
