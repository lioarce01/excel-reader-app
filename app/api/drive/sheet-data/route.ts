import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_API_KEY = "AIzaSyC8j4nxZ-g4yXoBOqZNPAXK2fNhYsRZl_c"

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A:C?key=${GOOGLE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Error fetching spreadsheet data")
    }

    const sheetData = await response.json()
    const rows = sheetData.values || []

    const data = rows.slice(1).map((row: any) => ({
      nombre: row[0] || "",
      code1: row[1] || "",
      code2: row[2] || "",
    }))

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching sheet data:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
