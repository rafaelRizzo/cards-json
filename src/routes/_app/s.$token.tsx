// Página de um card compartilhado por link (só para logados): copiar o texto ou salvar uma cópia na própria conta.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { CheckIcon, CopyIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSharedCard } from "@/hooks/use-card-shares"
import { useCards } from "@/hooks/use-cards"
import { formatDateTime } from "@/lib/format"
import { CardIconTile } from "@/lib/icons"
import { fadeUp, staggerContainer } from "@/lib/motion"

export const Route = createFileRoute("/_app/s/$token")({
    component: SharedCardPage,
})

function SharedCardPage() {
    const { token } = Route.useParams()
    const navigate = useNavigate()
    const { data: card, isLoading, isError, refetch } = useSharedCard(token)
    const { createCard, saving } = useCards()
    const [copied, setCopied] = useState(false)
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => () => clearTimeout(copiedTimer.current), [])

    const handleCopy = async () => {
        if (!card) return
        try {
            await navigator.clipboard.writeText(card.content)
            setCopied(true)
            clearTimeout(copiedTimer.current)
            copiedTimer.current = setTimeout(() => setCopied(false), 1800)
        } catch {
            toast.error("Não foi possível copiar. Permita o acesso à área de transferência no navegador.")
        }
    }

    // A cópia é um card novo e independente: depois de salvo, não depende mais do link nem da validade dele.
    const handleSave = async () => {
        if (!card) return
        const created = await createCard({
            title: card.title,
            content: card.content,
            icon: card.icon,
            color: card.color,
        })
        if (created) await navigate({ to: "/" })
    }

    return (
        <div className="flex min-h-full flex-col">
            <main className="mx-auto w-full max-w-2xl flex-1 p-6">
                {isLoading && (
                    <div className="grid gap-4">
                        <Skeleton className="h-16 w-2/3" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                )}

                {isError && (
                    <div className="grid place-items-center gap-3 py-16 text-center">
                        <h1 className="font-semibold text-2xl">Não foi possível abrir o link</h1>
                        <p className="text-muted-foreground text-sm">Confira sua conexão e tente de novo.</p>
                        <Button onClick={() => refetch()}>Tentar de novo</Button>
                    </div>
                )}

                {!isLoading && !isError && card === null && (
                    <div className="grid place-items-center gap-3 py-16 text-center">
                        <h1 className="font-semibold text-2xl">Link inválido ou expirado</h1>
                        <p className="max-w-sm text-muted-foreground text-sm">
                            Esse link pode ter vencido ou ter sido desativado por quem compartilhou. Peça um novo link.
                        </p>
                        <Button nativeButton={false} render={<Link to="/" />}>
                            Ir para os meus cards
                        </Button>
                    </div>
                )}

                {card && (
                    <motion.div
                        variants={staggerContainer(0.07)}
                        initial="hidden"
                        animate="show"
                        className="grid gap-5"
                    >
                        <motion.p variants={fadeUp} className="text-muted-foreground text-xs">
                            Compartilhado com você · vale até {formatDateTime(card.expiresAt)}
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex items-center gap-3">
                            <CardIconTile
                                icon={card.icon}
                                color={card.color}
                                className="size-12 rounded-xl"
                                iconClassName="size-6"
                            />
                            <h1 className="min-w-0 truncate font-semibold text-2xl">{card.title}</h1>
                        </motion.div>

                        <motion.pre
                            variants={fadeUp}
                            className="whitespace-pre-wrap break-words rounded-xl border bg-muted/40 p-4 font-mono text-sm leading-relaxed"
                        >
                            {card.content}
                        </motion.pre>

                        <motion.div variants={fadeUp} className="flex flex-col gap-2 sm:flex-row">
                            <Button size="lg" className="sm:flex-1" onClick={handleCopy}>
                                {copied ? <CheckIcon /> : <CopyIcon />}
                                {copied ? "Copiado!" : "Copiar texto"}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="sm:flex-1"
                                disabled={saving}
                                onClick={handleSave}
                            >
                                {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
                                Salvar na minha conta
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
