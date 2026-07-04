import "./globals.css"
import { ReactNode } from "react"
import { Inter, Space_Grotesk } from "next/font/google"
import { AuthProvider } from "@/hooks/use-auth"
import { MyThemeProvider } from "@/components/theme-provider"

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>
        <MyThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MyThemeProvider>
      </body>
    </html>
  )
}
