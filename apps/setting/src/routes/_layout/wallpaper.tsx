import WallpaperContainer from '@/shared/components/wallpaper/wallpaper-container'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/wallpaper')({
  component: RouteComponent
})

function RouteComponent() {
  return <WallpaperContainer />
}
