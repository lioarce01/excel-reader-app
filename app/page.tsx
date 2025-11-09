"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Search } from "lucide-react"
import { DataTable } from "@/components/data-table"

// Hardcoded file ID
const FILE_ID = "1mIUk2iWeqwTedupPo5vMo2NwsbWEM2hqQoqOmKG471A"

export default function Home() {
  const [sheetData, setSheetData] = useState<{ nombre: string; code1: string; code2: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // New code form state
  const [newCode, setNewCode] = useState({ nombre: "", code1: "", code2: "" })
  const [addingCode, setAddingCode] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Auto-fetch data on mount
  useEffect(() => {
    loadSheetData()
  }, [])

  const loadSheetData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/drive/sheet-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: FILE_ID }),
      })

      if (!response.ok) {
        throw new Error("Error al obtener los datos de la hoja")
      }

      const data = await response.json()
      setSheetData(data.data)
    } catch (err: any) {
      setError(err.message || "Error al leer el contenido de la hoja")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCode = async () => {
    if (!newCode.nombre.trim() || !newCode.code1.trim() || !newCode.code2.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    setAddingCode(true)
    setError("")

    try {
      const response = await fetch("/api/drive/add-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: FILE_ID,
          nombre: newCode.nombre,
          code1: newCode.code1,
          code2: newCode.code2,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al agregar el código")
      }

      // Update UI immediately
      setSheetData([...sheetData, { ...newCode }])
      setNewCode({ nombre: "", code1: "", code2: "" })
    } catch (err: any) {
      setError(err.message || "Error al agregar el código")
    } finally {
      setAddingCode(false)
    }
  }

  const handleDeleteCode = async (index: number) => {
    try {
      const response = await fetch("/api/drive/delete-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: FILE_ID,
          rowIndex: index,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el código")
      }

      // Update UI immediately
      const newData = sheetData.filter((_, i) => i !== index)
      setSheetData(newData)
    } catch (err: any) {
      setError(err.message || "Error al eliminar el código")
    }
  }

  // Pagination logic
  // Filter data based on search term
  const filteredData = sheetData.filter((row) =>
    row.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic on filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Cargando datos...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Códigos Zawardo</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Ver Códigos
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Código
            </TabsTrigger>
          </TabsList>

          {/* Tab: Ver Códigos */}
          <TabsContent value="view" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Códigos Zawardo</CardTitle>
                <CardDescription>Total de códigos: {searchTerm ? `${filteredData.length} de ${sheetData.length}` : sheetData.length}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* Search Bar */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>

                <DataTable
                  data={paginatedData}
                  loading={false}
                  onDelete={handleDeleteCode}
                  startIndex={startIndex}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} - {Math.min(endIndex, filteredData.length)} de {filteredData.length}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Agregar Código */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Agregar Nuevo Código
                </CardTitle>
                <CardDescription>Agrega un nuevo código de personaje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Personaje"
                      value={newCode.nombre}
                      onChange={(e) => setNewCode({ ...newCode, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code1">Code 1</Label>
                    <Input
                      id="code1"
                      placeholder="Código 1"
                      value={newCode.code1}
                      onChange={(e) => setNewCode({ ...newCode, code1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code2">Code 2</Label>
                    <Input
                      id="code2"
                      placeholder="Código 2"
                      value={newCode.code2}
                      onChange={(e) => setNewCode({ ...newCode, code2: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddCode} disabled={addingCode} className="w-full" size="lg">
                  {addingCode ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Agregando código...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Agregar Código
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
