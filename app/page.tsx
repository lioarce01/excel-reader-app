"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, FolderOpen, Loader2 } from "lucide-react"
import { FileList } from "@/components/file-list"
import { DataTable } from "@/components/data-table"

export default function Home() {
  const [folderId, setFolderId] = useState("")
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [sheetData, setSheetData] = useState<{ nombre: string; code1: string; code2: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")

  const handleFetchFiles = async () => {
    if (!folderId.trim()) {
      setError("Por favor ingresa un ID de carpeta")
      return
    }

    setLoading(true)
    setError("")
    setFiles([])
    setSelectedFile(null)
    setSheetData([])

    try {
      const response = await fetch("/api/drive/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      })

      if (!response.ok) {
        throw new Error("Error al obtener los archivos")
      }

      const data = await response.json()
      setFiles(data.files)
    } catch (err: any) {
      setError(err.message || "Error al conectar con Google Drive")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFile = async (file: any) => {
    setSelectedFile(file)
    setLoadingData(true)
    setError("")
    setSheetData([])

    try {
      const response = await fetch("/api/drive/sheet-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id }),
      })

      if (!response.ok) {
        throw new Error("Error al obtener los datos de la hoja")
      }

      const data = await response.json()
      setSheetData(data.data)
    } catch (err: any) {
      setError(err.message || "Error al leer el contenido de la hoja")
    } finally {
      setLoadingData(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Lector de Excel</h1>
          <p className="text-muted-foreground">Lee archivos Excel desde Google Drive y visualiza el contenido</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Input Section */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Carpeta de Drive
              </CardTitle>
              <CardDescription>Ingresa el ID de la carpeta de Google Drive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder-id">ID de Carpeta</Label>
                <Input
                  id="folder-id"
                  placeholder="1a2b3c4d5e6f7g8h9i0j"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFetchFiles()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">El ID está en la URL de la carpeta de Google Drive</p>
              </div>
              <Button onClick={handleFetchFiles} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Buscar Archivos"
                )}
              </Button>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File List Section */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Archivos Disponibles
              </CardTitle>
              <CardDescription>Selecciona una hoja de cálculo para ver su contenido</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList files={files} selectedFile={selectedFile} onSelectFile={handleSelectFile} loading={loading} />
            </CardContent>
          </Card>
        </div>

        {/* Data Table Section */}
        {selectedFile && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contenido: {selectedFile.name}</CardTitle>
              <CardDescription>Columnas: Nombre, Code 1 y Code 2</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={sheetData} loading={loadingData} />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
