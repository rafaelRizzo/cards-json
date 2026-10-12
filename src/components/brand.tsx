// Marca do app (ícone + nome); `inverted` é a versão clara para fundos na cor primária.
import { LayersIcon } from "lucide-react"
import { motion } from "motion/react"
import { bouncySpring } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Props = { inverted?: boolean; size?: "sm" | "md" }

export function Brand({ inverted = false, size = "md" }: Props) {
    return (
        <div className="flex items-center gap-2.5">
            <motion.span
                whileHover={{ rotate: -10, scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                transition={bouncySpring}
                className={cn(
                    "grid place-items-center",
                    size === "md" ? "size-9 rounded-xl" : "size-8 rounded-lg",
                    inverted ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
                )}
            >
                <LayersIcon className={size === "md" ? "size-5" : "size-4"} />
            </motion.span>
            <span className={cn("font-heading font-semibold tracking-tight", size === "md" ? "text-xl" : "text-lg")}>
                Cards
            </span>
        </div>
    )
}
