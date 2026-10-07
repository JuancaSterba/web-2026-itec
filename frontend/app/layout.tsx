import "./globals.css"
import { ReactNode } from "react"
import { Inter, Space_Grotesk } from "next/font/google"
import { AuthProvider } from "@/hooks/use-auth"
import { MyThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { LimpiarDatosLegados } from "@/components/auth/limpiar-datos-legados"
import { getUsuarioActual } from "@/lib/auth-server"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata = {
  title: "Backoffice ITEC",
  description: "Sistema académico",
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // La sesion se lee en el servidor desde las cookies httpOnly (RF-10).
  const usuario = await getUsuarioActual()

  return (
    <html lang="es" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>
        <MyThemeProvider>
          <LimpiarDatosLegados />
          <AuthProvider usuario={usuario}>
            {children}
          </AuthProvider>
          <Toaster />
        </MyThemeProvider>
      </body>
    </html>
  )
}
