import "./globals.css"
import { ReactNode } from "react"
import { AuthProvider } from "@/hooks/use-auth"

export const metadata = {
  title: "Backoffice ITEC",
  description: "Sistema académico",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
