import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

const GOOGLE_API_KEY = "AIzaSyC8j4nxZ-g4yXoBOqZNPAXK2fNhYsRZl_c"

// Service Account credentials (you'll need to set these up)
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    const { fileId, code } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // First, get the current data to find the last row
    const getResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${fileId}/values/A:C?key=${GOOGLE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!getResponse.ok) {
      const error = await getResponse.json()
      throw new Error(error.error?.message || "Error fetching spreadsheet data")
    }

    const sheetData = await getResponse.json()
    const rows = sheetData.values || []
    const nextRow = rows.length + 1

    // Check if service account is configured
    if (SERVICE_ACCOUNT_EMAIL && SERVICE_ACCOUNT_PRIVATE_KEY) {
      // Use service account for authentication
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: SERVICE_ACCOUNT_EMAIL,
          private_key: SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      const sheets = google.sheets({ version: "v4", auth })

      // Append the code to the next available row
      await sheets.spreadsheets.values.append({
        spreadsheetId: fileId,
        range: `A${nextRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[code]],
        },
      })

      return NextResponse.json({
        success: true,
        row: nextRow,
        message: `Code added successfully at row ${nextRow}`,
      })
    } else {
      // Service account not configured
      return NextResponse.json(
        {
          error:
            "Service account not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.",
          nextRow,
          instructions:
            "To enable this feature, you need to: 1) Create a service account in Google Cloud Console, 2) Download the JSON credentials, 3) Share your spreadsheet with the service account email, 4) Add the credentials to environment variables.",
        },
        { status: 503 },
      )
    }
  } catch (error: any) {
    console.error("Error uploading code:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
