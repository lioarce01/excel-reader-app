"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchTab } from "@/components/search-tab"
import { UploadTab } from "@/components/upload-tab"
import { Search, Upload } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Lector de Excel</h1>
          <p className="text-muted-foreground">Lee archivos Excel desde Google Drive y visualiza el contenido</p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Códigos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <SearchTab />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <UploadTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
