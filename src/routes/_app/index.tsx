// Dashboard: lista de cards (ativos/arquivados) à esquerda e prévia à direita (no celular, a prévia abre num dialog).
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { CardFormDialog } from "@/components/Cards/card-form-dialog"
import { ShareCardDialog } from "@/components/Cards/share-card-dialog"
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { CardListPane } from "@/components/Dashboard/card-list-pane"
import { CardPreview } from "@/components/Dashboard/card-preview"
import { EmptyPreview } from "@/components/Dashboard/empty-preview"
import { PreviewSkeleton } from "@/components/Dashboard/preview-skeleton"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { isShareExpired, useCardShares } from "@/hooks/use-card-shares"
import { type Card, type CardForm, useCardCounts, useCards } from "@/hooks/use-cards"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useMediaQuery } from "@/hooks/use-media-query"

export const Route = createFileRoute("/_app/")({
    // Busca e aba vivem na URL (?q=, ?view=), então dá para recarregar ou compartilhar o filtro.
    validateSearch: z.object({ q: z.string().optional(), view: z.enum(["active", "archived"]).optional() }),
    component: DashboardPage,
})

const COPIED_FEEDBACK_MS = 1800
// Espera a pessoa parar de digitar antes de consultar o servidor.
const SEARCH_DEBOUNCE_MS = 300

function DashboardPage() {
    const { q = "", view = "active" } = Route.useSearch()
    const navigate = Route.useNavigate()
    const isDesktop = useMediaQuery("(min-width: 1024px)")
    // q atualiza a cada tecla (o campo responde na hora); a consulta usa o valor com debounce.
    const debouncedQ = useDebouncedValue(q, SEARCH_DEBOUNCE_MS)
    const {
        cards,
        total,
        loading,
        fetching,
        hasNextPage,
        loadingMore,
        fetchNextPage,
        saving,
        createCard,
        updateCard,
        archiveCard,
        pinCard,
        deleteCard,
        pinningId,
        archivingId,
        deletingId,
    } = useCards({ view, search: debouncedQ })
    // counts fica undefined até a primeira resposta: as abas mostram um esqueleto em vez de "0".
    const { data: counts } = useCardCounts()
    const { shares, findShare } = useCardShares()

    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editingCard, setEditingCard] = useState<Card | null>(null)
    const [sharingCard, setSharingCard] = useState<Card | null>(null)
    const [archivingCard, setArchivingCard] = useState<Card | null>(null)
    const [deletingCard, setDeletingCard] = useState<Card | null>(null)

    const searchRef = useRef<HTMLInputElement>(null)
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const sharedIds = useMemo(
        () => new Set(shares.filter((share) => !isShareExpired(share)).map((share) => share.cardId)),
        [shares],
    )

    // Se o card selecionado sumiu (busca, aba, arquivar ou excluir), cai no primeiro da lista.
    const selected = cards.find((card) => card.id === selectedId) ?? cards[0] ?? null

    const loadMore = () => {
        if (hasNextPage && !loadingMore) fetchNextPage()
    }

    useEffect(() => () => clearTimeout(copiedTimer.current), [])

    // Atalho "/" foca a busca, como em ferramentas de comando.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")
            if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
                event.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const copyCard = async (card: Card) => {
        try {
            await navigator.clipboard.writeText(card.content)
            setCopiedId(card.id)
            clearTimeout(copiedTimer.current)
            copiedTimer.current = setTimeout(() => setCopiedId(null), COPIED_FEEDBACK_MS)
        } catch {
            toast.error("Não foi possível copiar. Permita o acesso à área de transferência no navegador.")
        }
    }

    const selectCard = (card: Card) => {
        setSelectedId(card.id)
        if (!isDesktop) setMobilePreviewOpen(true)
    }

    const moveSelection = (delta: number) => {
        if (cards.length === 0) return
        const current = cards.findIndex((card) => card.id === selected?.id)
        const next = Math.min(Math.max(current + delta, 0), cards.length - 1)
        setSelectedId(cards[next].id)
        // Chegou no fim do que está carregado e ainda tem mais: já busca a próxima página.
        if (delta > 0 && next === cards.length - 1) loadMore()
    }

    const setSearch = (value: string) =>
        navigate({ search: (prev) => ({ ...prev, q: value || undefined }), replace: true })

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault()
            moveSelection(1)
        } else if (event.key === "ArrowUp") {
            event.preventDefault()
            moveSelection(-1)
        } else if (event.key === "Enter" && selected) {
            event.preventDefault()
            copyCard(selected)
        } else if (event.key === "Escape" && q) {
            setSearch("")
        }
    }

    const openCreate = () => {
        setEditingCard(null)
        setFormOpen(true)
    }

    const openEdit = (card: Card) => {
        setMobilePreviewOpen(false)
        setEditingCard(card)
        setFormOpen(true)
    }

    const openShare = (card: Card) => {
        setMobilePreviewOpen(false)
        setSharingCard(card)
    }

    const openDelete = (card: Card) => {
        setMobilePreviewOpen(false)
        setDeletingCard(card)
    }

    // Arquivar pede confirmação; restaurar é seguro e reversível, então vai direto.
    const toggleArchive = (card: Card) => {
        setMobilePreviewOpen(false)
        if (card.archivedAt === null) setArchivingCard(card)
        else archiveCard(card.id, false)
    }

    // Arquivar não desativa o link: o aviso da confirmação diz isso quando o card está compartilhado.
    const archivingShare = archivingCard ? findShare(archivingCard.id) : undefined
    const archivingIsShared = archivingShare !== undefined && !isShareExpired(archivingShare)

    // O dialog só fecha se salvou; em erro o toast avisa e o formulário continua preenchido.
    const handleSubmit = async (form: CardForm) => {
        if (editingCard) {
            if (await updateCard(editingCard.id, form)) setFormOpen(false)
            return
        }
        const created = await createCard(form)
        if (!created) return
        // Card novo nasce ativo e no topo: limpa a busca e volta pra aba dele, senão ele pode ficar escondido.
        navigate({ search: (prev) => ({ ...prev, view: undefined, q: undefined }), replace: true })
        setSelectedId(created.id)
        setFormOpen(false)
    }

    // Ação em andamento no card selecionado (a prévia desabilita os botões e põe o spinner no que está rodando).
    const pending = selected
        ? pinningId === selected.id
            ? "pin"
            : archivingId === selected.id
              ? "archive"
              : deletingId === selected.id
                ? "delete"
                : null
        : null

    const preview = selected ? (
        <CardPreview
            card={selected}
            pending={pending}
            copied={copiedId === selected.id}
            share={findShare(selected.id)}
            onCopy={copyCard}
            onPin={(card) => pinCard(card.id, card.pinnedAt === null)}
            onEdit={openEdit}
            onShare={openShare}
            onArchive={toggleArchive}
            onDelete={openDelete}
        />
    ) : null

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="mx-auto grid min-h-0 w-full max-w-6xl flex-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
                <CardListPane
                    cards={cards}
                    total={total}
                    view={view}
                    counts={counts}
                    loading={loading}
                    // buscando = o texto digitado ainda não foi consultado (debounce) ou a consulta está em andamento
                    searching={q.trim() !== "" && (q !== debouncedQ || fetching)}
                    hasNextPage={hasNextPage}
                    loadingMore={loadingMore}
                    onLoadMore={loadMore}
                    searchTerm={q}
                    searchRef={searchRef}
                    selectedId={selected?.id}
                    copiedId={copiedId}
                    sharedIds={sharedIds}
                    onViewChange={(next) =>
                        navigate({
                            search: (prev) => ({ ...prev, view: next === "active" ? undefined : next }),
                            replace: true,
                        })
                    }
                    onSearchChange={setSearch}
                    onSearchKeyDown={handleSearchKeyDown}
                    onSelect={selectCard}
                    onCreate={openCreate}
                />

                {isDesktop && (
                    <section className="min-h-0 overflow-hidden" aria-label="Prévia do card">
                        {loading ? (
                            <PreviewSkeleton />
                        ) : (
                            (preview ?? (
                                <EmptyPreview
                                    view={view}
                                    hasCards={debouncedQ.trim() ? (counts?.[view] ?? 1) > 0 : total > 0}
                                    searchTerm={debouncedQ}
                                    onCreate={openCreate}
                                />
                            ))
                        )}
                    </section>
                )}
            </div>

            {!isDesktop && (
                <Dialog open={mobilePreviewOpen && selected !== null} onOpenChange={setMobilePreviewOpen}>
                    <DialogContent className="h-[85dvh] sm:max-w-lg">
                        <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
                        <DialogDescription className="sr-only">
                            Prévia do texto do card e ações disponíveis.
                        </DialogDescription>
                        {preview}
                    </DialogContent>
                </Dialog>
            )}

            <CardFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                card={editingCard}
                saving={saving}
                onSubmit={handleSubmit}
            />

            <ShareCardDialog card={sharingCard} onOpenChange={(open) => !open && setSharingCard(null)} />

            <ConfirmActionDialog
                open={archivingCard !== null}
                onOpenChange={(open) => !open && setArchivingCard(null)}
                title="Arquivar card"
                description={
                    <>
                        {`"${archivingCard?.title}" sai da lista de ativos e vai para Arquivados. Você pode restaurar quando quiser.`}
                        {archivingIsShared &&
                            " Este card tem um link de compartilhamento ativo, e ele continua funcionando até vencer ou ser desativado."}
                    </>
                }
                confirmLabel="Arquivar"
                busyLabel="Arquivando..."
                onConfirm={() => (archivingCard ? archiveCard(archivingCard.id, true) : Promise.resolve(false))}
            />

            <ConfirmDeleteDialog
                open={deletingCard !== null}
                onOpenChange={(open) => !open && setDeletingCard(null)}
                title="Remover card"
                description={`Tem certeza que deseja remover "${deletingCard?.title}"? Essa ação não poderá ser desfeita. Se só quer tirar da lista, arquive.`}
                confirmLabel="Remover"
                busyLabel="Removendo..."
                onConfirm={() => (deletingCard ? deleteCard(deletingCard.id) : Promise.resolve(false))}
            />
        </div>
    )
}
