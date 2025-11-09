import { NextResponse } from "next/server"
import { google } from "googleapis"

const GOOGLE_CLIENT_ID = "134874716533-oodke5dtlt3e13dl785oocudl9p4q7uq.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`
  : "http://localhost:3000/api/auth/callback"

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

  const scopes = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })

  return NextResponse.redirect(authUrl)
}
