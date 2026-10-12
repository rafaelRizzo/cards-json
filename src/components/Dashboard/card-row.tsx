// Linha da lista de cards: ícone colorido, título e uma linha do texto; marca o selecionado e o recém-copiado.
// O destaque (layoutId) voa entre linhas: ele fica em z-0 e todo o conteúdo em z-10, para nunca cobrir o texto.
import { CheckIcon, PinIcon, Share2Icon } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useEffect, useRef } from "react"
import type { Card } from "@/hooks/use-cards"
import { CardIconTile } from "@/lib/icons"
import { bouncySpring, softSpring, spring } from "@/lib/motion"

type Props = { card: Card; selected: boolean; copied: boolean; shared: boolean; onSelect: (card: Card) => void }

// Variantes herdadas do stagger da lista (CardListPane).
const rowVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: softSpring },
}

export function CardRow({ card, selected, copied, shared, onSelect }: Props) {
    const ref = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (selected) ref.current?.scrollIntoView({ block: "nearest" })
    }, [selected])

    return (
        <motion.li
            layout="position"
            variants={rowVariants}
            exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
        >
            {/* Sem transform no botão (nada de whileTap): senão ele vira um contexto de empilhamento e o destaque em
                voo, que pertence à linha nova, passa por cima do texto da linha antiga. */}
            <button
                ref={ref}
                type="button"
                aria-current={selected}
                onClick={() => onSelect(card)}
                className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
                {selected && (
                    <>
                        <motion.span
                            layoutId="row-bg"
                            transition={spring}
                            className="absolute inset-0 z-0 rounded-lg bg-accent"
                        />
                        <motion.span
                            layoutId="row-indicator"
                            transition={spring}
                            className="absolute top-2 bottom-2 left-0 z-0 w-0.5 rounded-full bg-primary"
                        />
                    </>
                )}
                <CardIconTile
                    icon={card.icon}
                    color={card.color}
                    className="relative z-10 size-9 rounded-lg"
                    iconClassName="size-4"
                    animate={selected ? { scale: 1.08, rotate: -4 } : { scale: 1, rotate: 0 }}
                    transition={bouncySpring}
                />
                <span className="relative z-10 min-w-0 flex-1">
                    <span className="block truncate font-medium text-sm">{card.title}</span>
                    <span className="block truncate text-muted-foreground text-xs">
                        {card.content.replace(/\s+/g, " ")}
                    </span>
                </span>
                {card.pinnedAt && (
                    <PinIcon
                        className="relative z-10 size-3.5 shrink-0 rotate-45 fill-current text-muted-foreground"
                        aria-label="Fixado"
                    />
                )}
                {shared && (
                    <Share2Icon
                        className="relative z-10 size-3.5 shrink-0 text-muted-foreground"
                        aria-label="Link ativo"
                    />
                )}
                <AnimatePresence>
                    {copied && (
                        <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={bouncySpring}
                            className="relative z-10 shrink-0"
                        >
                            <CheckIcon className="size-4 text-primary" aria-label="Copiado" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
        </motion.li>
    )
}
