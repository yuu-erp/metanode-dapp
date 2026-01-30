'use client'
import { DATA_COUNTRY } from '@/constants'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'

interface LanguageItemProps {
  idx: string
  image: string
  name: string
  country: string
}

function LanguageItem({ idx, image, name, country }: LanguageItemProps) {
  return (
    <Label
      htmlFor={idx}
      className="h-13 w-full bg-white rounded-xl flex items-center px-2 gap-3 cursor-pointer"
    >
      <Avatar className="size-10">
        <AvatarImage src={image} />
        <AvatarFallback className="bg-black/40 font-semibold text-xs">{country}</AvatarFallback>
      </Avatar>

      <div className="flex flex-1 items-center h-full">
        <span className="line-clamp-1 break-all text-black font-semibold">{name}</span>
      </div>

      <RadioGroupItem value={idx} id={idx} />
    </Label>
  )
}

function Languages() {
  const [indexCountry, setIndexCountry] = React.useState(0)
  return (
    <RadioGroup
      value={String(indexCountry)}
      onValueChange={(value) => setIndexCountry(Number(value))}
      className="h-full w-full overflow-y-auto mt-5 no-scrollbar"
    >
      {DATA_COUNTRY.map((item, idx) => (
        <LanguageItem
          idx={String(idx)}
          key={item.id}
          image={item.image}
          name={item.name}
          country={item.country[0]}
        />
      ))}
    </RadioGroup>
  )
}

export default React.memo(Languages)
