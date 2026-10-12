// Prévia ao vivo do formulário: mostra o card do jeito que vai aparecer no dashboard, enquanto você digita.
import { AnimatePresence } from "motion/react"
import { CardIconTile } from "@/lib/icons"
import { bouncySpring } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Props = { title: string; content: string; icon: string; color: string }

export function CardLivePreview({ title, content, icon, color }: Props) {
    return (
        <aside aria-label="Prévia do card" className="rounded-2xl border bg-muted/40 p-4 md:sticky md:top-0">
            <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Prévia</p>
            <div className="flex items-center gap-3">
                <AnimatePresence mode="popLayout" initial={false}>
                    <CardIconTile
                        key={`${icon}-${color}`}
                        icon={icon}
                        color={color}
                        className="size-12 rounded-xl"
                        iconClassName="size-6"
                        initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={bouncySpring}
                    />
                </AnimatePresence>
                <h3 className={cn("min-w-0 truncate font-semibold text-xl", !title && "text-muted-foreground/60")}>
                    {title || "Título do card"}
                </h3>
            </div>
            <pre
                className={cn(
                    "mt-4 hidden max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border bg-background p-3 font-mono text-xs leading-relaxed md:block",
                    !content && "text-muted-foreground/60",
                )}
            >
                {content || "O texto que será copiado aparece aqui."}
            </pre>
        </aside>
    )
}
