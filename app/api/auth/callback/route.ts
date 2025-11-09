import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"

const GOOGLE_CLIENT_ID = "134874716533-oodke5dtlt3e13dl785oocudl9p4q7uq.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`
  : "http://localhost:3000/api/auth/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

    const { tokens } = await oauth2Client.getToken(code)

    // Store tokens in httpOnly cookies
    const cookieStore = await cookies()

    if (tokens.access_token) {
      cookieStore.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
      })
    }

    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Error during OAuth callback:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
