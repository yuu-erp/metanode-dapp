import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated/staff/_authenticated/stations')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_authenticated/staff/_authenticated/stations"!</div>
}
