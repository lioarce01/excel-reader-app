import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const { fileId, rowIndex } = await request.json()

    if (!fileId || rowIndex === undefined) {
      return NextResponse.json(
        { error: "File ID and row index are required" },
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

    // The rowIndex from frontend is 0-based, but spreadsheet rows are 1-based
    // Also need to skip header row, so actual row number is rowIndex + 2
    const actualRowNumber = rowIndex + 2

    // Delete the row using batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: fileId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // First sheet
                dimension: "ROWS",
                startIndex: actualRowNumber - 1, // 0-based for API
                endIndex: actualRowNumber, // exclusive
              },
            },
          },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting code:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
