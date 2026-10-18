// Botão de alternar tema claro/escuro, com o ícone girando na troca.
import { MoonIcon, SunIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Tip } from "@/components/tip"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const label = theme === "dark" ? "Usar tema claro" : "Usar tema escuro"

    return (
        <Tip label={label} side="bottom">
            <Button variant="ghost" size="icon" aria-label={label} onClick={toggleTheme}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={theme}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex"
                    >
                        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                    </motion.span>
                </AnimatePresence>
            </Button>
        </Tip>
    )
}
