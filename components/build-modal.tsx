"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { BuildData } from "@/types/build"
import { User, Shield, Star, Package, Archive } from "lucide-react"

interface BuildModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  build: BuildData | null
  characterName: string
}

export function BuildModal({ open, onOpenChange, build, characterName }: BuildModalProps) {
  if (!build) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{characterName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-80px)] pr-4">
          <div className="space-y-6">
            {/* Character Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Usuario</p>
                  <p className="text-sm font-semibold">{build.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Clase</p>
                  <p className="text-sm font-semibold">{build.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nivel</p>
                  <p className="text-sm font-semibold">{build.level}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Versiones</p>
                <p className="text-xs font-medium">{build.played_version}</p>
              </div>
            </div>

            {/* Hero Inventory */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Hero Inventory</h3>
                <Badge variant="secondary" className="ml-auto">
                  {build.hero_inventory.length} items
                </Badge>
              </div>
              <div className="grid gap-2">
                {build.hero_inventory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bag */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-secondary" />
                <h3 className="text-lg font-bold">Bag</h3>
                <Badge variant="secondary" className="ml-auto">
                  {build.bag.length} items
                </Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {build.bag.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-secondary/20 border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-8">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Archive className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-bold">Storage</h3>
                <Badge variant="secondary" className="ml-auto">
                  {build.storage.length} items
                </Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {build.storage.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-accent/20 border border-accent/30 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-8">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
