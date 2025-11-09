"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, FolderOpen, Loader2, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { FileList } from "@/components/file-list"

export function UploadTab() {
  const [folderId, setFolderId] = useState("")
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFetchFiles = async () => {
    if (!folderId.trim()) {
      setError("Por favor ingresa un ID de carpeta")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setFiles([])
    setSelectedFile(null)

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

  const handleSelectFile = (file: any) => {
    setSelectedFile(file)
    setError("")
    setSuccess("")
  }

  const handleUploadCode = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona una hoja")
      return
    }

    if (!code.trim()) {
      setError("Por favor ingresa un código")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/drive/upload-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          code: code.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir el código")
      }

      const data = await response.json()
      setSuccess(`Código agregado exitosamente en la fila ${data.row}`)
      setCode("")
    } catch (err: any) {
      setError(err.message || "Error al subir el código")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
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
              <Label htmlFor="upload-folder-id">ID de Carpeta</Label>
              <Input
                id="upload-folder-id"
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
          </CardContent>
        </Card>

        {/* File List Section */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Hojas Disponibles
            </CardTitle>
            <CardDescription>Selecciona una hoja de cálculo para subir el código</CardDescription>
          </CardHeader>
          <CardContent>
            <FileList files={files} selectedFile={selectedFile} onSelectFile={handleSelectFile} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Upload Code Section */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Código
            </CardTitle>
            <CardDescription>
              El código se agregará en la siguiente fila disponible de la hoja: {selectedFile.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-input">Código</Label>
              <Input
                id="code-input"
                placeholder="Ingresa el código aquí..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUploadCode()
                  }
                }}
              />
            </div>
            <Button onClick={handleUploadCode} disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Código
                </>
              )}
            </Button>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
