import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"

const GOOGLE_CLIENT_ID = "134874716533-oodke5dtlt3e13dl785oocudl9p4q7uq.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("google_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    oauth2Client.setCredentials({ access_token: accessToken })

    const sheets = google.sheets({ version: "v4", auth: oauth2Client })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "A:B",
    })

    const rows = response.data.values || []

    // Skip header row and map to nombre/codigo format
    const data = rows.slice(1).map((row) => ({
      nombre: row[0] || "",
      codigo: row[1] || "",
    }))

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching sheet data:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
