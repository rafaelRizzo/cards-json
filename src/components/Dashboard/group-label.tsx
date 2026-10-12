// Rótulo que separa os grupos da lista ("Fixados" e "Outros"), animado junto com as linhas.
import { motion, type Variants } from "motion/react"

// Variantes herdadas do stagger da lista (CardListPane).
const labelVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
    return (
        <motion.li
            layout="position"
            variants={labelVariants}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="px-3 pt-2 pb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide"
        >
            {children}
        </motion.li>
    )
}
