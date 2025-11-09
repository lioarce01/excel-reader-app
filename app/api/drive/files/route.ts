import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_API_KEY = "AIzaSyC8j4nxZ-g4yXoBOqZNPAXK2fNhYsRZl_c"

export async function POST(request: NextRequest) {
  try {
    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType='application/vnd.google-apps.spreadsheet'+or+mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')+and+trashed=false&fields=files(id,name,mimeType)&orderBy=name&key=${GOOGLE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Error fetching files from Drive")
    }

    const data = await response.json()
    return NextResponse.json({ files: data.files || [] })
  } catch (error: any) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
