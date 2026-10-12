// Rodapé de um campo com limite: dica ou erro (trocam com animação), contador e barrinha que enche enquanto digita.
import { AnimatePresence, motion } from "motion/react"
import { spring } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Props = {
    // id usado pelo campo em aria-describedby
    id: string
    hint: string
    error?: string
    length: number
    max: number
}

// A partir daqui a barra e o contador avisam que o limite está perto.
const NEAR_LIMIT = 0.9

const formatNumber = (value: number) => value.toLocaleString("pt-BR")

export function FieldFooter({ id, hint, error, length, max }: Props) {
    const ratio = length / max
    const over = length > max
    const near = !over && ratio >= NEAR_LIMIT

    return (
        <div id={id} className="grid gap-1.5">
            <div className="h-0.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                    className={cn(
                        "h-full rounded-full transition-colors duration-200",
                        over ? "bg-destructive" : near ? "bg-amber-500" : "bg-primary/60",
                    )}
                    initial={false}
                    animate={{ width: `${Math.min(ratio, 1) * 100}%` }}
                    transition={spring}
                />
            </div>

            <div className="flex items-start justify-between gap-3 text-xs">
                <div className="min-h-4 min-w-0 flex-1">
                    <AnimatePresence mode="wait" initial={false}>
                        {error ? (
                            <motion.p
                                key="error"
                                role="alert"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.15 }}
                                className="text-destructive"
                            >
                                {error}
                            </motion.p>
                        ) : (
                            <motion.p
                                key="hint"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.15 }}
                                className="text-muted-foreground"
                            >
                                {hint}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Treme uma vez ao passar do limite (a key troca quando entra e quando sai do estado "acima"). */}
                <motion.span
                    key={over ? "over" : "ok"}
                    animate={over ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                        "shrink-0 tabular-nums transition-colors duration-200",
                        over
                            ? "font-medium text-destructive"
                            : near
                              ? "font-medium text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground",
                    )}
                >
                    {over
                        ? `${formatNumber(length - max)} acima · ${formatNumber(length)} / ${formatNumber(max)}`
                        : `${formatNumber(length)} / ${formatNumber(max)}`}
                </motion.span>
            </div>
        </div>
    )
}
