import { images } from '@/assets/images'
const LoadingApp = () => {
  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center z-[999] bg-white">
      <img
        src={images.logo}
        alt="Logo"
        className="w-[80px] aspect-square animate-logo-transform rounded-full relative z-10"
      />
      <img src={images.backgroundMobile} alt="" className="absolute inset-0 w-full h-full z-0" />
    </div>
  )
}

export default LoadingApp
