export interface BuildData {
  username: string
  class: string
  level: number
  played_version: string
  compatible_version: string
  hero_inventory: string[]
  bag: string[]
  storage: string[]
}

export interface ParsedBuildResult {
  success: boolean
  data?: BuildData
  error?: string
}
