'use client'

import {
  type ColumnDef,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Id ổn định cho hàng (mặc định TanStack dùng index). Dùng khi một “natural key” (vd địa chỉ) có thể trùng giữa các loại bản ghi. */
  getRowId?: (originalRow: TData, index: number) => string
  /** Bọc mỗi hàng body (ví dụ ContextMenu); `children` là `<TableRow>...</TableRow>`. */
  bodyRowWrapper?: (opts: { row: Row<TData>; children: ReactNode }) => ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  bodyRowWrapper
}: DataTableProps<TData, TValue>) {
  const ref = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(500)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  useEffect(() => {
    const el = ref.current
    if (el) setH(el.getBoundingClientRect().height)
  }, [])
  return (
    <div className={cn(`overflow-hidden h-full rounded-md border`)} ref={ref}>
      <Table
        containerStyle={{
          maxHeight: `${h}px`,
          overflowY: 'auto'
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-10 bg-secondary backdrop-blur-app"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const rowNode = (
                <TableRow data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
              return (
                <Fragment key={row.id}>
                  {bodyRowWrapper ? bodyRowWrapper({ row, children: rowNode }) : rowNode}
                </Fragment>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
