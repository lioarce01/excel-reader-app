import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Simulated response - En producción, esto debería usar la Google Sheets API
    // Ejemplo de datos simulados
    const mockData = [
      { nombre: "Juan Pérez", codigo: "JP001" },
      { nombre: "María González", codigo: "MG002" },
      { nombre: "Carlos Rodríguez", codigo: "CR003" },
      { nombre: "Ana Martínez", codigo: "AM004" },
      { nombre: "Luis Sánchez", codigo: "LS005" },
      { nombre: "Laura Fernández", codigo: "LF006" },
      { nombre: "Pedro López", codigo: "PL007" },
      { nombre: "Sofía Ramírez", codigo: "SR008" },
      { nombre: "Diego Torres", codigo: "DT009" },
      { nombre: "Valentina Castro", codigo: "VC010" },
    ]

    // Aquí deberías implementar la llamada real a Google Sheets API:
    /*
    const { google } = require('googleapis')
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: 'A:B', // Columnas A y B (nombre y código)
    })
    
    const rows = response.data.values || []
    const data = rows.slice(1).map(row => ({
      nombre: row[0] || '',
      codigo: row[1] || '',
    }))
    */

    return NextResponse.json({ data: mockData })
  } catch (error: any) {
    console.error("Error fetching sheet data:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
