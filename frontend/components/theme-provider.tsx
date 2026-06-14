"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"

export function MyThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  )
}
