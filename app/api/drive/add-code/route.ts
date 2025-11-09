import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const { fileId, nombre, code1, code2 } = await request.json()

    if (!fileId || !nombre || !code1 || !code2) {
      return NextResponse.json(
        { error: "File ID, nombre, code1, and code2 are required" },
        { status: 400 }
      )
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
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Append new row to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: fileId,
      range: "A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nombre, code1, code2]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error adding code:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
