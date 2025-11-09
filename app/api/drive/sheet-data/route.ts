import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import type { BuildData } from "@/types/build"

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Load service account credentials from environment variable
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!serviceAccountJson) {
      return NextResponse.json(
        { error: "Service account credentials not configured" },
        { status: 500 }
      )
    }

    const serviceAccountKey = JSON.parse(serviceAccountJson)

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Get spreadsheet data including build column (D)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "A:D",
    })

    const rows = response.data.values || []

    const data = rows.slice(1).map((row) => {
      let build: BuildData | null = null

      // Parse build JSON if exists
      if (row[3]) {
        try {
          build = JSON.parse(row[3])
        } catch (error) {
          console.error("Error parsing build JSON:", error)
        }
      }

      return {
        nombre: row[0] || "",
        code1: row[1] || "",
        code2: row[2] || "",
        build,
      }
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching sheet data:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
