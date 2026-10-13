// Coluna da esquerda do dashboard: título, "Novo card", abas Ativos/Arquivados, busca (atalho "/") e a lista de cards.
import { PlusIcon, SearchIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import type { RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Card, CardView } from "@/hooks/use-cards"
import { hoverSpring, staggerContainer } from "@/lib/motion"
import { CardRow } from "./card-row"
import { GroupLabel } from "./group-label"
import { LoadMore } from "./load-more"

type Props = {
    cards: Card[]
    // total da aba atual (antes da busca) e quantos há em cada aba
    total: number
    view: CardView
    // undefined = ainda carregando (mostra esqueleto no lugar do número)
    counts: Record<CardView, number> | undefined
    loading: boolean
    // busca em andamento (debounce ou consulta rodando)
    searching: boolean
    hasNextPage: boolean
    loadingMore: boolean
    onLoadMore: () => void
    searchTerm: string
    searchRef: RefObject<HTMLInputElement | null>
    selectedId: string | undefined
    copiedId: string | null
    // cards que têm link de compartilhamento ativo
    sharedIds: ReadonlySet<string>
    onViewChange: (view: CardView) => void
    onSearchChange: (value: string) => void
    onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
    onSelect: (card: Card) => void
    onCreate: () => void
}

export function CardListPane({
    cards,
    total,
    view,
    counts,
    loading,
    searching,
    hasNextPage,
    loadingMore,
    onLoadMore,
    searchTerm,
    searchRef,
    selectedId,
    copiedId,
    sharedIds,
    onViewChange,
    onSearchChange,
    onSearchKeyDown,
    onSelect,
    onCreate,
}: Props) {
    const unit = (count: number) =>
        searchTerm.trim()
            ? count === 1
                ? "resultado"
                : "resultados"
            : view === "archived"
              ? count === 1
                  ? "arquivado"
                  : "arquivados"
              : count === 1
                ? "card"
                : "cards"
    // Total do servidor (aba + busca) e, se ainda não carregou tudo, quantos já estão na tela.
    const countText = loading
        ? "Carregando…"
        : searching
          ? "Buscando…"
          : hasNextPage
            ? `Mostrando ${cards.length} de ${total} ${unit(total)}`
            : `${total} ${unit(total)}`

    // Os fixados vêm primeiro (a ordem é do servidor); só separa em grupos quando existem os dois.
    const firstUnpinned = cards.findIndex((card) => card.pinnedAt === null)
    const hasPinned = cards.some((card) => card.pinnedAt !== null)

    return (
        <section className="flex min-h-0 flex-col border-b lg:border-r lg:border-b-0" aria-label="Seus cards">
            <div className="grid gap-3 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-2xl">Seus cards</h1>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }} transition={hoverSpring}>
                        <Button onClick={onCreate}>
                            <PlusIcon />
                            Novo card
                        </Button>
                    </motion.div>
                </div>
                <Tabs value={view} onValueChange={(next) => onViewChange(next as CardView)}>
                    <TabsList className="w-full">
                        <TabsTrigger value="active">
                            Ativos{" "}
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {counts ? counts.active : <Skeleton className="inline-block h-3 w-3 align-middle" />}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="archived">
                            Arquivados{" "}
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {counts ? counts.archived : <Skeleton className="inline-block h-3 w-3 align-middle" />}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        ref={searchRef}
                        type="search"
                        value={searchTerm}
                        autoComplete="off"
                        placeholder="Buscar por título ou texto"
                        aria-label="Buscar cards"
                        className="pr-9 pl-9"
                        onChange={(event) => onSearchChange(event.target.value)}
                        onKeyDown={onSearchKeyDown}
                    />
                    <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground lg:block">
                        /
                    </kbd>
                </div>
                <div className="h-4 overflow-hidden text-muted-foreground text-xs" aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                            key={countText}
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.14 }}
                        >
                            {countText}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1" viewportClassName="px-2 pb-3">
                {loading ? (
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-2 px-1">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                ) : (
                    <motion.ul
                        variants={staggerContainer(0.045)}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-[minmax(0,1fr)] gap-0.5"
                    >
                        <AnimatePresence initial={false} mode="popLayout">
                            {hasPinned && <GroupLabel key="label-pinned">Fixados</GroupLabel>}
                            {cards.map((card, index) => [
                                hasPinned && index === firstUnpinned && (
                                    <GroupLabel key="label-others">Outros</GroupLabel>
                                ),
                                <CardRow
                                    key={card.id}
                                    card={card}
                                    selected={card.id === selectedId}
                                    copied={card.id === copiedId}
                                    shared={sharedIds.has(card.id)}
                                    onSelect={onSelect}
                                />,
                            ])}
                        </AnimatePresence>
                    </motion.ul>
                )}
                {!loading && <LoadMore hasMore={hasNextPage} loading={loadingMore} onLoadMore={onLoadMore} />}
            </ScrollArea>
        </section>
    )
}
