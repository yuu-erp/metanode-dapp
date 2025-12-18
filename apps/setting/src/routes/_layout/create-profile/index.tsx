import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/create-profile/')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_layout/create-profile/"!</div>
}
