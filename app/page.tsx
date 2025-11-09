"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, FolderOpen, Loader2, LogOut } from "lucide-react"
import { FileList } from "@/components/file-list"
import { DataTable } from "@/components/data-table"

export default function Home() {
  const [folderId, setFolderId] = useState("")
  const [files, setFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [sheetData, setSheetData] = useState<{ nombre: string; codigo: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (err) {
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/login"
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setIsAuthenticated(false)
    setFiles([])
    setSelectedFile(null)
    setSheetData([])
  }

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

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Lector de Excel</CardTitle>
            <CardDescription className="text-base mt-2">
              Inicia sesión con Google para acceder a tus archivos de Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Iniciar sesión con Google
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Lector de Excel</h1>
            <p className="text-muted-foreground">Lee archivos Excel desde Google Drive y visualiza el contenido</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
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
              <CardDescription>Columnas: Nombre y Código</CardDescription>
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
