// Links compartilhados: todos os links criados pelo usuário, com copiar e desativar (só o dono vê e desativa).
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeftIcon, Link2Icon } from "lucide-react"
import { motion } from "motion/react"
import { useMemo, useState } from "react"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { ShareLinkRow } from "@/components/Links/share-link-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type CardShare, isShareExpired, useCardShares } from "@/hooks/use-card-shares"
import { fadeUp, staggerContainer } from "@/lib/motion"

export const Route = createFileRoute("/_app/links")({
    component: LinksPage,
})

function LinksPage() {
    const { shares, loading, unshareCard } = useCardShares()
    const [removing, setRemoving] = useState<CardShare | null>(null)

    // Ativos primeiro (o que vence antes aparece antes); vencidos por último.
    const rows = useMemo(() => {
        const items = shares.map((share) => ({ share, card: share.card }))
        const time = (iso: string) => new Date(iso).getTime()
        return items.sort((a, b) => {
            const aExpired = isShareExpired(a.share)
            const bExpired = isShareExpired(b.share)
            if (aExpired !== bExpired) return aExpired ? 1 : -1
            return aExpired
                ? time(b.share.expiresAt) - time(a.share.expiresAt)
                : time(a.share.expiresAt) - time(b.share.expiresAt)
        })
    }, [shares])

    const activeCount = rows.filter(({ share }) => !isShareExpired(share)).length
    const removingCard = removing?.card

    return (
        <div className="flex min-h-full flex-col">
            <main className="mx-auto w-full max-w-3xl flex-1 p-6">
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/" />}>
                    <ArrowLeftIcon />
                    Meus cards
                </Button>

                <h1 className="mt-4 font-semibold text-3xl">Links compartilhados</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    {loading
                        ? "Carregando…"
                        : `${activeCount} ${activeCount === 1 ? "link ativo" : "links ativos"}. Só você vê e desativa estes links, e quem recebe precisa estar logado.`}
                </p>

                <div className="mt-6">
                    {loading && (
                        <div className="grid gap-3">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    )}

                    {!loading && rows.length === 0 && (
                        <motion.div
                            variants={staggerContainer(0.08)}
                            initial="hidden"
                            animate="show"
                            className="grid place-items-center gap-2 rounded-xl border border-dashed py-16 text-center"
                        >
                            <motion.span
                                variants={fadeUp}
                                className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"
                            >
                                <Link2Icon />
                            </motion.span>
                            <motion.h2 variants={fadeUp} className="font-semibold text-xl">
                                Nenhum link compartilhado
                            </motion.h2>
                            <motion.p variants={fadeUp} className="max-w-sm text-muted-foreground text-sm">
                                Abra um card e use o botão de compartilhar para criar um link com validade.
                            </motion.p>
                        </motion.div>
                    )}

                    {!loading && rows.length > 0 && (
                        <motion.ul
                            variants={staggerContainer(0.06)}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                        >
                            {rows.map(({ share, card }) => (
                                <ShareLinkRow key={share.cardId} card={card} share={share} onRemove={setRemoving} />
                            ))}
                        </motion.ul>
                    )}
                </div>
            </main>

            <ConfirmDeleteDialog
                open={removing !== null}
                onOpenChange={(open) => !open && setRemoving(null)}
                title={removing && isShareExpired(removing) ? "Remover link vencido" : "Desativar link"}
                description={
                    removing && isShareExpired(removing)
                        ? `O link do card "${removingCard?.title}" já venceu. Remover só limpa esta lista.`
                        : `Quem tiver o link do card "${removingCard?.title}" deixa de conseguir abrir. Você pode criar outro depois.`
                }
                confirmLabel={removing && isShareExpired(removing) ? "Remover" : "Desativar"}
                busyLabel="Desativando..."
                onConfirm={() => (removing ? unshareCard(removing.cardId) : Promise.resolve(false))}
            />
        </div>
    )
}
