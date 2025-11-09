import type { BuildData, ParsedBuildResult } from "@/types/build"

export function parseBuildFile(content: string): ParsedBuildResult {
  try {
    const lines = content.split("\n").map((line) => line.trim())

    // Extract content from Preload calls
    const preloadContents: string[] = []
    const preloadRegex = /call\s+Preload\s*\(\s*"(.*)"\s*\)/

    for (const line of lines) {
      const match = line.match(preloadRegex)
      if (match && match[1]) {
        preloadContents.push(match[1])
      }
    }

    // Extract metadata
    let username = ""
    let characterClass = ""
    let level = 0
    let playedVersion = ""
    let compatibleVersion = ""

    for (const content of preloadContents) {
      if (content.startsWith("User Name:")) {
        username = content.replace("User Name:", "").trim()
      } else if (content.startsWith("Class:")) {
        characterClass = content.replace("Class:", "").trim()
      } else if (content.startsWith("Level:")) {
        const levelMatch = content.match(/Level:\s*(\d+)/)
        if (levelMatch) {
          level = parseInt(levelMatch[1], 10)
        }
      } else if (content.startsWith("Played Version:")) {
        playedVersion = content.replace("Played Version:", "").trim()
      } else if (content.startsWith("Compatible Version:")) {
        compatibleVersion = content.replace("Compatible Version:", "").trim()
      }
    }

    // Extract items from sections
    const heroInventory: string[] = []
    const bag: string[] = []
    const storage: string[] = []

    let currentSection = ""
    const itemRegex = /^\d+\.\s*(.+)$/

    for (const content of preloadContents) {
      // Detect section headers
      if (content.includes("----------Hero Inventory----------")) {
        currentSection = "hero_inventory"
        continue
      } else if (content.includes("----------Bag----------")) {
        currentSection = "bag"
        continue
      } else if (content.includes("----------Storage----------")) {
        currentSection = "storage"
        continue
      } else if (content.startsWith("-------")) {
        // End of sections
        currentSection = ""
        continue
      }

      // Extract items
      const itemMatch = content.match(itemRegex)
      if (itemMatch && currentSection) {
        const itemName = itemMatch[1]
        if (currentSection === "hero_inventory") {
          heroInventory.push(itemName)
        } else if (currentSection === "bag") {
          bag.push(itemName)
        } else if (currentSection === "storage") {
          storage.push(itemName)
        }
      }
    }

    // Validation
    if (!username || !characterClass || level === 0) {
      return {
        success: false,
        error: "Archivo incompleto: falta información del personaje (nombre, clase o nivel)",
      }
    }

    const buildData: BuildData = {
      username,
      class: characterClass,
      level,
      played_version: playedVersion,
      compatible_version: compatibleVersion,
      hero_inventory: heroInventory,
      bag,
      storage,
    }

    return {
      success: true,
      data: buildData,
    }
  } catch (error) {
    return {
      success: false,
      error: `Error al parsear el archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}
