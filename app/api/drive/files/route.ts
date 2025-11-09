import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    // Load service account credentials
    const serviceAccountPath = path.join(process.cwd(), "service-account.json")
    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))

    // Authenticate with Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Query files in the specified folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') and trashed=false`,
      fields: "files(id,name,mimeType)",
      orderBy: "name",
    })

    return NextResponse.json({ files: response.data.files || [] })
  } catch (error: any) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
