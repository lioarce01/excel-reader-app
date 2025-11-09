"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Search, Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { BuildData } from "@/types/build"
import { parseBuildFile } from "@/lib/build-parser"
import { toast } from "sonner"

// Hardcoded file ID
const FILE_ID = "1mIUk2iWeqwTedupPo5vMo2NwsbWEM2hqQoqOmKG471A"

interface SheetRow {
  nombre: string
  code1: string
  code2: string
  build: BuildData | null
}

export default function Home() {
  const [sheetData, setSheetData] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // New code form state
  const [newCode, setNewCode] = useState({ nombre: "", code1: "", code2: "" })
  const [buildFile, setBuildFile] = useState<File | null>(null)
  const [buildFileContent, setBuildFileContent] = useState<string>("")
  const [parsedBuild, setParsedBuild] = useState<BuildData | null>(null)
  const [addingCode, setAddingCode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // Filter state
  const [classFilter, setClassFilter] = useState<string>("")

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

  const handleFileChange = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError("Por favor selecciona un archivo .txt")
      return
    }

    setBuildFile(file)

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setBuildFileContent(content)
      
      // Parse the file to extract code1 and code2 automatically
      const parseResult = parseBuildFile(content)
      if (parseResult.success && parseResult.data) {
        const buildData = parseResult.data
        setParsedBuild(buildData)
        
        // Auto-fill code1, code2, and nombre (username) from the parsed file
        setNewCode(prev => ({
          nombre: prev.nombre || buildData.username || "",
          code1: buildData.code1 || "",
          code2: buildData.code2 || "",
        }))
        
        toast.success("Archivo parseado correctamente", {
          description: `Clase: ${buildData.class} - Nivel: ${buildData.level}`,
        })
      } else {
        // If parsing fails, clear the codes and show error
        setParsedBuild(null)
        setNewCode(prev => ({
          ...prev,
          code1: "",
          code2: "",
        }))
        toast.error("Error al parsear el archivo", {
          description: parseResult.error || "Formato de archivo inválido",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileChange(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleAddCode = async () => {
    if (!newCode.nombre.trim()) {
      setError("Por favor ingresa un nombre")
      return
    }

    if (!buildFileContent) {
      setError("Por favor selecciona un archivo de build")
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
          code1: newCode.code1 || "",
          code2: newCode.code2 || "",
          buildFileContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al agregar el código")
      }

      // Reload data to get the new entry with parsed build
      await loadSheetData()

      // Reset form
      setNewCode({ nombre: "", code1: "", code2: "" })
      setBuildFile(null)
      setBuildFileContent("")
      setParsedBuild(null)
      
      toast.success("Código agregado exitosamente", {
        description: `"${newCode.nombre}" ha sido agregado a la base de datos`,
      })
    } catch (err: any) {
      const errorMessage = err.message || "Error al agregar el código"
      setError(errorMessage)
      toast.error("Error al agregar el código", {
        description: errorMessage,
      })
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
      const deletedItem = sheetData[index]
      const newData = sheetData.filter((_, i) => i !== index)
      setSheetData(newData)
      
      toast.success("Código eliminado", {
        description: `"${deletedItem.nombre}" ha sido eliminado`,
      })
    } catch (err: any) {
      const errorMessage = err.message || "Error al eliminar el código"
      setError(errorMessage)
      toast.error("Error al eliminar el código", {
        description: errorMessage,
      })
    }
  }

  // Filter data based on search term and class filter
  const filteredData = sheetData.filter((row) => {
    const matchesSearch = row.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.build?.class.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !classFilter || row.build?.class === classFilter
    return matchesSearch && matchesClass
  })

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(sheetData.map(row => row.build?.class).filter(Boolean))) as string[]

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
                <CardDescription>
                  {searchTerm || classFilter 
                    ? `Mostrando ${filteredData.length} de ${sheetData.length} códigos`
                    : `Total de códigos: ${sheetData.length}`
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Search Bar and Filters */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre o clase..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Class Filter */}
                  {uniqueClasses.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Filtrar por clase:</span>
                      <Button
                        variant={classFilter === "" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setClassFilter("")
                          setCurrentPage(1)
                        }}
                      >
                        Todas
                      </Button>
                      {uniqueClasses.map((cls) => (
                        <Button
                          key={cls}
                          variant={classFilter === cls ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setClassFilter(cls)
                            setCurrentPage(1)
                          }}
                        >
                          {cls}
                        </Button>
                      ))}
                    </div>
                  )}
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
                    <Label htmlFor="code1">
                      Code 1 <span className="text-xs text-muted-foreground font-normal">(opcional - se extrae automáticamente)</span>
                    </Label>
                    <Input
                      id="code1"
                      placeholder="Se extraerá automáticamente del archivo..."
                      value={newCode.code1}
                      onChange={(e) => setNewCode({ ...newCode, code1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code2">
                      Code 2 <span className="text-xs text-muted-foreground font-normal">(opcional - se extrae automáticamente)</span>
                    </Label>
                    <Input
                      id="code2"
                      placeholder="Se extraerá automáticamente del archivo..."
                      value={newCode.code2}
                      onChange={(e) => setNewCode({ ...newCode, code2: e.target.value })}
                    />
                  </div>
                </div>

                {/* Build File Upload */}
                <div className="space-y-2">
                  <Label>Build File (archivo .txt) <span className="text-xs text-muted-foreground font-normal">- Los códigos se extraerán automáticamente</span></Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {buildFile ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{buildFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBuildFile(null)
                            setBuildFileContent("")
                            setParsedBuild(null)
                            // Clear code1 and code2 when file is removed, but keep nombre
                            setNewCode(prev => ({ nombre: prev.nombre, code1: "", code2: "" }))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">
                          Arrastra tu archivo .txt aquí o{" "}
                          <label className="text-primary hover:underline cursor-pointer">
                            haz click para seleccionar
                            <input
                              type="file"
                              accept=".txt"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileChange(e.target.files[0])
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Build Preview */}
                {parsedBuild && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold">Preview del Build</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Usuario</p>
                        <p className="font-medium">{parsedBuild.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Clase</p>
                        <p className="font-medium">{parsedBuild.class}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nivel</p>
                        <p className="font-medium">{parsedBuild.level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="font-medium">
                          {parsedBuild.hero_inventory.length + parsedBuild.bag.length + parsedBuild.storage.length} total
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                      <p>Inventory: {parsedBuild.hero_inventory.length} | Bag: {parsedBuild.bag.length} | Storage: {parsedBuild.storage.length}</p>
                    </div>
                  </div>
                )}

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
