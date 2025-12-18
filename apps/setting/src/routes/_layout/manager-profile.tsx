import ButtonBack from '@/shared/components/button-back'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/manager-profile')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      <ButtonBack />
    </div>
  )
}
