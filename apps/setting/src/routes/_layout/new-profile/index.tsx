import { CREATE_PROFILE_LIST_OPTION } from '@/constants'
import { ItemSelectedMethod } from '@/features/new-profile'
import ButtonBack from '@/shared/components/button-back'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/new-profile/')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <div className="w-full h-full container-app flex flex-col gap-2">
      {CREATE_PROFILE_LIST_OPTION.map((item, idx) => (
        <ItemSelectedMethod
          key={idx}
          title={item.title}
          content={item.content}
          img={item.img}
          onClick={() => navigate({ to: item.path })}
        />
      ))}
      <ButtonBack />
    </div>
  )
}
