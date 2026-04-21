'use client'
import { SearchInput } from '@/shared/components/search-input'
import * as React from 'react'
import { BoxRefetchDapp } from '.'

function ListSharedDapp() {
  return (
    <React.Fragment>
      <div className="flex-1 mt-3 flex flex-col gap-3">
        <SearchInput placeholder="Search" />
        <BoxRefetchDapp />
      </div>
    </React.Fragment>
  )
}

export default React.memo(ListSharedDapp)
