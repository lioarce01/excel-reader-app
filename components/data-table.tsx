"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2 } from "lucide-react"
import { useState } from "react"

interface DataTableProps {
  data: { nombre: string; code1: string; code2: string }[]
  loading: boolean
  onDelete?: (index: number) => void
  startIndex?: number
}

export function DataTable({ data, loading, onDelete, startIndex = 0 }: DataTableProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const truncateCode = (code: string, maxLength: number = 25) => {
    if (code.length <= maxLength) return code
    return code.substring(0, maxLength) + "..."
  }

  const handleCopy = async (text: string, index: string) => {
    await navigator.clipboard.writeText(`-load ${text}`)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDelete = async (index: number) => {
    if (onDelete && !deletingIndex) {
      setDeletingIndex(index)
      await onDelete(startIndex + index)
      setDeletingIndex(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="h-[490px] border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center font-semibold">#</TableHead>
            <TableHead className="w-[180px] font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Códigos</TableHead>
            <TableHead className="w-16 text-center font-semibold">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-center font-mono text-xs text-muted-foreground">
                {String(startIndex + index + 1).padStart(2, '0')}
              </TableCell>
              <TableCell className="w-[180px]">
                <div className="font-semibold text-base truncate" title={row.nombre}>
                  {row.nombre}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-5">
                  {/* Code 1 */}
                  <div className="flex items-center gap-2 w-[300px]">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">C1:</span>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs w-[240px] justify-start px-3 py-1 bg-primary/5 hover:bg-primary/10 transition-colors truncate"
                      title={row.code1}
                    >
                      {truncateCode(row.code1)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 shrink-0 hover:bg-primary/10"
                      onClick={() => handleCopy(row.code1, `${index}-code1`)}
                    >
                      {copiedIndex === `${index}-code1` ? (
                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Code 2 */}
                  <div className="flex items-center gap-2 w-[300px]">
                    <span className="text-xs font-medium text-muted-foreground shrink-0">C2:</span>
                    <Badge
                      variant="outline"
                      className="font-mono text-xs w-[240px] justify-start px-3 py-1 bg-secondary/50 hover:bg-secondary/70 transition-colors truncate"
                      title={row.code2}
                    >
                      {truncateCode(row.code2)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 shrink-0 hover:bg-primary/10"
                      onClick={() => handleCopy(row.code2, `${index}-code2`)}
                    >
                      {copiedIndex === `${index}-code2` ? (
                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(index)}
                  disabled={deletingIndex === index}
                >
                  {deletingIndex === index ? (
                    <div className="h-3.5 w-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
