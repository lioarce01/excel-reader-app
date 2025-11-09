"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface DataTableProps {
  data: { nombre: string; code1: string; code2: string }[]
  loading: boolean
}

export function DataTable({ data, loading }: DataTableProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const handleCopy = async (text: string, index: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
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
    <div className="rounded-md border">
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[250px]">Code 1</TableHead>
              <TableHead className="w-[250px]">Code 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">{row.nombre}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono flex-1">
                      {row.code1}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(row.code1, `${index}-code1`)}
                    >
                      {copiedIndex === `${index}-code1` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono flex-1">
                      {row.code2}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleCopy(row.code2, `${index}-code2`)}
                    >
                      {copiedIndex === `${index}-code2` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
