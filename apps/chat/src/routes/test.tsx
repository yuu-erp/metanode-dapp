import { decryptAesECDH } from '@metanodejs/system-core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test')({
  component: RouteComponent
})

function RouteComponent() {
  const handleDecryptConversation = async () => {
    try {
      const decryptValue = await decryptAesECDH(
        '042ad68b8b1860c6e750737fb6dd7ea81a7600cad81a5bdab9e5a80a192c10751b7f03589322f3bc15ff68bc35e7a5124882f079c60024e0f18a4815ce572ffe73',
        '77a1f4f69976dc33d05a0b8df190dcd061ca0080',
        '00000000000000000000000000000000124e0b6f8ff906fa6b2af39a3eaaece1e9879d451ce5fa5c73ce6e89907f2cdc'
      )
      console.log('decryptValue', decryptValue)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="h-screen flex items-center justify-center gap-4">
      <button
        className="px-6 py-3 rounded-lg bg-blue-500 text-white"
        onClick={handleDecryptConversation}
      >
        decrypt conversation
      </button>

      <button className="px-6 py-3 rounded-lg bg-green-500 text-white">Nút 2</button>
    </div>
  )
}
