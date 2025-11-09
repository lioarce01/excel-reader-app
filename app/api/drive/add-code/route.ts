import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { parseBuildFile } from "@/lib/build-parser"

export async function POST(request: NextRequest) {
  try {
    const { fileId, nombre, code1, code2, buildFileContent } = await request.json()

    if (!fileId || !nombre || !code1 || !code2 || !buildFileContent) {
      return NextResponse.json(
        { error: "File ID, nombre, code1, code2, and build file are required" },
        { status: 400 }
      )
    }

    // Parse build file
    const parseResult = parseBuildFile(buildFileContent)

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { error: parseResult.error || "Failed to parse build file" },
        { status: 400 }
      )
    }

    // Convert build data to JSON string for storage
    const buildJson = JSON.stringify(parseResult.data)

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

    // Append new row to the spreadsheet with build data
    await sheets.spreadsheets.values.append({
      spreadsheetId: fileId,
      range: "A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nombre, code1, code2, buildJson]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error adding code:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
