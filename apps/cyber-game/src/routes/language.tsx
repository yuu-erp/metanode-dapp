import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/shared/partials'

export const Route = createFileRoute('/language')({
  component: Language
})

function Language() {
  return (
    <div className="p-2">
      <AppHeader user={undefined} />
      <h3>Language Selection</h3>
    </div>
  )
}
