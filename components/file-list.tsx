"use client"

import { FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FileListProps {
  files: any[]
  selectedFile: any
  onSelectFile: (file: any) => void
  loading: boolean
}

export function FileList({ files, selectedFile, onSelectFile, loading }: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando archivos...</p>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No hay archivos para mostrar</p>
        <p className="text-xs text-muted-foreground mt-1">Ingresa un ID de carpeta para comenzar</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {files.map((file) => (
          <Button
            key={file.id}
            variant={selectedFile?.id === file.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onSelectFile(file)}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="truncate">{file.name}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
