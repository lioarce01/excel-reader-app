import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Load service account credentials
    const serviceAccountPath = path.join(process.cwd(), "service-account.json")
    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Get spreadsheet data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "A:C",
    })

    const rows = response.data.values || []

    const data = rows.slice(1).map((row) => ({
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
