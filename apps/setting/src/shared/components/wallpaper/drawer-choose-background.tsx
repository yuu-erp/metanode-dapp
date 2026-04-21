'use client'

import * as React from 'react'
import ButtonFooter from '../button-footer'
import { useRouter } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { ImagePlus } from 'lucide-react'
import { Photo } from './tabs'

function DrawerChooseBackground() {
  const router = useRouter()
  return (
    <div className="h-[60vh] background-card fixed bottom-0 left-0 right-0 rounded-4xl border-app flex flex-col px-3">
      <div className="flex-1 pt-5 flex flex-col overflow-hidden">
        <Tabs defaultValue="photo" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-transparent w-full flex items-center justify-around mb-2">
            <TabsTrigger value="photo">
              <Button className="size-8 rounded-full bg-white">
                <ImagePlus className="size-5 text-black/60" />
              </Button>
              <span className="text-xs font-semibold">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="gradient">
              <Button className="size-8 rounded-full bg-white">
                <ImagePlus className="size-5 text-black/60" />
              </Button>
              <span className="text-xs font-semibold">Gradient</span>
            </TabsTrigger>
            <TabsTrigger value="color">
              <Button className="size-8 rounded-full bg-white">
                <ImagePlus className="size-5 text-black/60" />
              </Button>
              <span className="text-xs font-semibold">Color</span>
            </TabsTrigger>
            <TabsTrigger value="dynamic">
              <Button className="size-8 rounded-full bg-white">
                <ImagePlus className="size-5 text-black/60" />
              </Button>
              <span className="text-xs font-semibold">Dynamic</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="photo" className="flex-1 w-full overflow-hidden">
            <Photo />
          </TabsContent>
          <TabsContent value="gradient" className="flex-1 w-full">
            gradient
          </TabsContent>
          <TabsContent value="color" className="flex-1 w-full">
            color
          </TabsContent>
          <TabsContent value="dynamic" className="flex-1 w-full">
            dynamic
          </TabsContent>
        </Tabs>
      </div>
      <ButtonFooter onBack={() => router.history.back()} />
    </div>
  )
}

export default React.memo(DrawerChooseBackground)
