// Tema claro/escuro via classe .dark no <html>, persistido no localStorage (padrão: escuro).
import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark"

type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void }

const STORAGE_KEY = "cards.theme"
// Cor da barra do navegador no celular: o --background de cada tema (escuro / claro).
const THEME_COLOR: Record<Theme, string> = { dark: "#0a0a0a", light: "#ffffff" }
const ThemeContext = createContext<ThemeContextValue | null>(null)

const readStoredTheme = (): Theme => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored === "light" || stored === "dark" ? stored : "dark"
    } catch {
        return "dark"
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(readStoredTheme)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark")
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme])
        try {
            localStorage.setItem(STORAGE_KEY, theme)
        } catch {
            // sem persistência, segue só na sessão
        }
    }, [theme])

    const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"))

    return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error("useTheme precisa estar dentro de <ThemeProvider>")
    return context
}
