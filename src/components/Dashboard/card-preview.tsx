// Prévia do card selecionado: título, texto em mono, ações (editar, compartilhar, arquivar, remover) e o botão de copiar.
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CheckIcon,
    CopyIcon,
    Loader2Icon,
    PencilIcon,
    PinIcon,
    PinOffIcon,
    Share2Icon,
    TrashIcon,
} from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { Tip } from "@/components/tip"
import { Button } from "@/components/ui/button"
import { type CardShare, isShareExpired } from "@/hooks/use-card-shares"
import type { Card } from "@/hooks/use-cards"
import { formatDate, formatRelative } from "@/lib/format"
import { CardIconTile } from "@/lib/icons"
import { bouncySpring, hoverSpring, softSpring, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

// Ação que está rodando no card (null = nenhuma): trava os botões e mostra o spinner no que está em andamento.
export type PendingAction = "pin" | "archive" | "delete" | null

type Props = {
    card: Card
    // omitido = nenhuma ação em andamento
    pending?: PendingAction
    copied: boolean
    // link de compartilhamento do card, se houver
    share: CardShare | undefined
    onCopy: (card: Card) => void
    onPin: (card: Card) => void
    onEdit: (card: Card) => void
    onShare: (card: Card) => void
    onArchive: (card: Card) => void
    onDelete: (card: Card) => void
}

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: softSpring },
}

export function CardPreview({
    card,
    pending = null,
    copied,
    share,
    onCopy,
    onPin,
    onEdit,
    onShare,
    onArchive,
    onDelete,
}: Props) {
    const archived = card.archivedAt !== null
    const pinned = card.pinnedAt !== null
    const words = card.content.split(/\s+/).filter(Boolean).length
    // Só conta como "editado" se mudou de fato depois de criado (no insert, created_at e updated_at recebem o mesmo now(); o trigger só mexe quando título, texto, ícone ou cor mudam).
    const edited = new Date(card.updatedAt).getTime() - new Date(card.createdAt).getTime() > 60_000
    const sharing = share && !isShareExpired(share) ? share : undefined
    const actions = [
        // Arquivado não fixa (o banco também solta o pino ao arquivar).
        ...(archived
            ? []
            : [
                  {
                      key: "pin",
                      label: pinned ? "Soltar do topo" : "Fixar no topo",
                      icon: pinned ? PinOffIcon : PinIcon,
                      onClick: () => onPin(card),
                  },
              ]),
        { key: "edit", label: "Editar card", icon: PencilIcon, onClick: () => onEdit(card) },
        { key: "share", label: "Compartilhar card", icon: Share2Icon, onClick: () => onShare(card) },
        {
            key: "archive",
            label: archived ? "Restaurar card" : "Arquivar card",
            icon: archived ? ArchiveRestoreIcon : ArchiveIcon,
            onClick: () => onArchive(card),
        },
        { key: "delete", label: "Remover card", icon: TrashIcon, onClick: () => onDelete(card) },
    ]

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.article
                key={card.id}
                variants={staggerContainer(0.06)}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -20, transition: { duration: 0.12 } }}
                className="flex h-full min-h-0 flex-col"
            >
                <motion.header variants={sectionVariants} className="flex items-start justify-between gap-4 p-6 pb-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <CardIconTile
                            icon={card.icon}
                            color={card.color}
                            className="size-12 rounded-xl"
                            iconClassName="size-6"
                            initial={{ scale: 0.4, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={bouncySpring}
                        />
                        <div className="min-w-0">
                            <h2 className="truncate font-semibold text-2xl">{card.title}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
                                {archived && <span className="rounded-full border px-2 py-0.5">Arquivado</span>}
                                {pinned && (
                                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
                                        <PinIcon className="size-3 rotate-45" />
                                        Fixado
                                    </span>
                                )}
                                {sharing && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                        <Share2Icon className="size-3" />
                                        Link até {formatDate(sharing.expiresAt)}
                                    </span>
                                )}
                                <span>
                                    {words} {words === 1 ? "palavra" : "palavras"} · {card.content.length} caracteres
                                </span>
                                <span>Criado {formatRelative(card.createdAt)}</span>
                                {edited && <span>Editado {formatRelative(card.updatedAt)}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                        {actions.map(({ key, label, icon: Icon, onClick }) => (
                            <motion.div
                                key={key}
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.88 }}
                                transition={hoverSpring}
                            >
                                <Tip label={label}>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label={label}
                                        aria-busy={pending === key}
                                        disabled={pending !== null}
                                        onClick={onClick}
                                    >
                                        {pending === key ? <Loader2Icon className="animate-spin" /> : <Icon />}
                                    </Button>
                                </Tip>
                            </motion.div>
                        ))}
                    </div>
                </motion.header>

                <motion.div variants={sectionVariants} className="min-h-0 flex-1 overflow-y-auto px-6">
                    <pre
                        className={cn(
                            "whitespace-pre-wrap break-words rounded-xl border bg-muted/40 p-4 font-mono leading-relaxed",
                            card.content.length <= 280 ? "text-sm" : "text-xs",
                        )}
                    >
                        {card.content}
                    </pre>
                </motion.div>

                <motion.footer variants={sectionVariants} className="p-6 pt-4">
                    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={hoverSpring}>
                        <Button size="lg" className="relative w-full overflow-hidden" onClick={() => onCopy(card)}>
                            <AnimatePresence>
                                {copied && (
                                    <motion.span
                                        aria-hidden="true"
                                        className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground"
                                        initial={{ scale: 0, opacity: 0.45 }}
                                        animate={{ scale: 12, opacity: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                    />
                                )}
                            </AnimatePresence>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={copied ? "copied" : "idle"}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                    transition={{ duration: 0.14 }}
                                    className="relative flex items-center gap-2"
                                >
                                    {copied ? (
                                        <motion.span
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={bouncySpring}
                                        >
                                            <CheckIcon />
                                        </motion.span>
                                    ) : (
                                        <CopyIcon />
                                    )}
                                    {copied ? "Copiado!" : "Copiar texto"}
                                </motion.span>
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                    <p className="mt-2 hidden text-center text-muted-foreground text-xs lg:block">
                        Pressione <kbd className="rounded border bg-muted px-1 font-mono">Enter</kbd> na busca para
                        copiar
                    </p>
                </motion.footer>
            </motion.article>
        </AnimatePresence>
    )
}
