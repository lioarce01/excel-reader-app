import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"

const GOOGLE_CLIENT_ID = "134874716533-oodke5dtlt3e13dl785oocudl9p4q7uq.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

export async function POST(request: NextRequest) {
  try {
    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("google_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    oauth2Client.setCredentials({ access_token: accessToken })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') and trashed=false`,
      fields: "files(id, name, mimeType)",
      orderBy: "name",
    })

    return NextResponse.json({ files: response.data.files || [] })
  } catch (error: any) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
