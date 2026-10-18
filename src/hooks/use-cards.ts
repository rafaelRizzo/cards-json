// Cards: tipos, schema do formulário e CRUD no Supabase, com lista paginada e busca no servidor (RLS isola por usuário).
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useSession } from "@/hooks/use-session"
import { colors, iconMap } from "@/lib/icons"
import { coerceLegacyCard } from "@/lib/legacy-cards"
import { withToast } from "@/lib/mutation"
import { containsAnyOf } from "@/lib/postgrest"
import { supabase } from "@/lib/supabase"

export const TITLE_MAX = 80
export const CONTENT_MAX = 5000
// Tamanho da página da lista; a exportação usa lotes de 1.000, o teto de linhas por resposta da API.
export const PAGE_SIZE = 30
const EXPORT_BATCH = 1000
// Mesmo teto do trigger enforce_cards_pin_rules (supabase/20261012153900_pin.sql).
export const PIN_LIMIT = 10
// Códigos que o Postgres devolve quando o teto de fixados estoura: 54000 no pin.sql e 53400 depois do pin_hardening.sql.
const PIN_LIMIT_ERROR_CODES = ["54000", "53400"]

const formatLimit = (limit: number) => limit.toLocaleString("pt-BR")

// Os mesmos limites e formatos valem no banco (supabase/20261012153500_schema.sql e 20261012153800_limits.sql): a tela avisa antes, o banco garante.
export const cardFormSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Dê um título ao card")
        .max(TITLE_MAX, `O título aceita até ${formatLimit(TITLE_MAX)} caracteres`)
        .regex(/^[^\r\n]+$/, "O título deve ficar em uma linha só"),
    content: z
        .string()
        .trim()
        .min(1, "Escreva o texto do card")
        .max(CONTENT_MAX, `O texto aceita até ${formatLimit(CONTENT_MAX)} caracteres`),
    // Só valores do catálogo da tela (Object.hasOwn: "toString" e afins não podem passar como ícone).
    icon: z.string().refine((key) => Object.hasOwn(iconMap, key), "Escolha um ícone da lista"),
    color: z.string().refine((name) => colors.includes(name), "Escolha uma cor da lista"),
})

export type CardForm = z.infer<typeof cardFormSchema>
// archivedAt: null = ativo; preenchido = arquivado. pinnedAt: null = solto; preenchido = fixado no topo (ISO 8601).
export type Card = CardForm & {
    id: string
    archivedAt: string | null
    pinnedAt: string | null
    createdAt: string
    updatedAt: string
}
// Qual lista a tela mostra: cards ativos ou arquivados.
export type CardView = "active" | "archived"
export type CardCounts = Record<CardView, number>

// O banco manda só estas colunas; o que não bate com o formato vira erro em vez de dado quebrado na tela.
const COLUMNS = "id, title, content, icon, color, archived_at, pinned_at, created_at, updated_at"
const cardRowSchema = cardFormSchema
    .extend({
        id: z.string(),
        archived_at: z.string().nullable(),
        pinned_at: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
    })
    .transform(
        ({ archived_at, pinned_at, created_at, updated_at, ...card }): Card => ({
            ...card,
            archivedAt: archived_at,
            pinnedAt: pinned_at,
            createdAt: created_at,
            updatedAt: updated_at,
        }),
    )

// Teto de fixados estourado: o toast mostra uma mensagem própria em vez da genérica.
class PinLimitError extends Error {}

type CardsPage = { cards: Card[]; total: number; nextOffset: number | null }

// Uma página (fixados primeiro, depois do mais novo pro mais antigo; o id v7 desempata) já com o total que bate com a aba e a busca.
const fetchCardsPage = async (view: CardView, search: string, offset: number): Promise<CardsPage> => {
    let query = supabase.from("cards").select(COLUMNS, { count: "exact" })
    query = view === "active" ? query.is("archived_at", null) : query.not("archived_at", "is", null)
    const term = search.trim()
    if (term) query = query.or(containsAnyOf(["title", "content"], term))

    const { data, count, error } = await query
        .order("pinned_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)
    if (error) throw error

    const cards = z.array(cardRowSchema).parse(data)
    const total = count ?? cards.length
    return { cards, total, nextOffset: offset + cards.length < total ? offset + cards.length : null }
}

const countCards = async (view: CardView) => {
    let query = supabase.from("cards").select("id", { count: "exact", head: true })
    query = view === "active" ? query.is("archived_at", null) : query.not("archived_at", "is", null)
    const { count, error } = await query
    if (error) throw error
    return count ?? 0
}

// Exportação precisa de TODOS os cards: busca em lotes de 1.000 (o teto da API) até acabar.
const fetchAllForExport = async (): Promise<CardForm[]> => {
    const all: CardForm[] = []
    for (let offset = 0; ; offset += EXPORT_BATCH) {
        const { data, error } = await supabase
            .from("cards")
            .select("title, content, icon, color")
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .range(offset, offset + EXPORT_BATCH - 1)
        if (error) throw error
        all.push(...z.array(cardFormSchema).parse(data))
        if (data.length < EXPORT_BATCH) return all
    }
}

// Quantos cards há em cada aba (independe da busca).
export function useCardCounts() {
    const userId = useSession()?.user.id
    return useQuery({
        queryKey: ["cards", "counts", userId],
        enabled: !!userId,
        staleTime: 5 * 60_000,
        queryFn: async (): Promise<CardCounts> => {
            const [active, archived] = await Promise.all([countCards("active"), countCards("archived")])
            return { active, archived }
        },
    })
}

type ListParams = { view: CardView; search: string }

// Sem `params`, só as ações (criar, editar, arquivar...) ficam disponíveis e nenhuma lista é buscada.
export function useCards(params?: ListParams) {
    const queryClient = useQueryClient()
    const userId = useSession()?.user.id
    const view = params?.view ?? "active"
    const search = params?.search ?? ""

    const list = useInfiniteQuery({
        queryKey: ["cards", "list", userId, view, search],
        enabled: !!params && !!userId,
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchCardsPage(view, search, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        // Enquanto uma nova busca carrega, mantém a lista anterior na tela, mas só dentro da mesma aba.
        placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[3] === view ? previous : undefined),
    })

    const cards = list.data?.pages.flatMap((page) => page.cards) ?? []
    const total = list.data?.pages[0]?.total ?? 0

    // Qualquer mudança reflete na lista (todas as páginas já carregadas) e nos contadores das abas.
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cards"] })

    const createMutation = useMutation({
        mutationFn: async (form: CardForm) => {
            const { data, error } = await supabase
                .from("cards")
                .insert(cardFormSchema.parse(form))
                .select(COLUMNS)
                .single()
            if (error) throw error
            return cardRowSchema.parse(data)
        },
        onSuccess: invalidate,
    })
    const updateMutation = useMutation({
        mutationFn: async ({ id, form }: { id: string; form: CardForm }) => {
            const { data, error } = await supabase
                .from("cards")
                .update(cardFormSchema.parse(form))
                .eq("id", id)
                .select(COLUMNS)
                .single()
            if (error) throw error
            return cardRowSchema.parse(data)
        },
        onSuccess: invalidate,
    })
    const archiveMutation = useMutation({
        mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
            const { data, error } = await supabase
                .from("cards")
                .update({ archived_at: archived ? new Date().toISOString() : null })
                .eq("id", id)
                .select(COLUMNS)
                .single()
            if (error) throw error
            return cardRowSchema.parse(data)
        },
        onSuccess: invalidate,
    })
    const pinMutation = useMutation({
        mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
            const { data, error } = await supabase
                .from("cards")
                .update({ pinned_at: pinned ? new Date().toISOString() : null })
                .eq("id", id)
                .select(COLUMNS)
                .single()
            if (error) {
                if (PIN_LIMIT_ERROR_CODES.includes(error.code)) throw new PinLimitError()
                throw error
            }
            return cardRowSchema.parse(data)
        },
        onSuccess: invalidate,
    })
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("cards").delete().eq("id", id)
            if (error) throw error
            return id
        },
        onSuccess: invalidate,
    })
    // Importar ACRESCENTA: nunca apaga o que já existe. Aceita o formato do app antigo (id solto, título com quebra de
    // linha, ícone/cor desconhecidos). Cards acima dos limites ficam de fora e voltam na lista de ignorados.
    const importMutation = useMutation({
        mutationFn: async (raw: unknown[]) => {
            const valid: CardForm[] = []
            const skippedTitles: string[] = []
            for (const item of raw) {
                const coerced = coerceLegacyCard(item)
                const parsed = cardFormSchema.safeParse(coerced)
                if (parsed.success) valid.push(parsed.data)
                else skippedTitles.push(coerced?.title.trim() || "(sem título)")
            }
            if (valid.length === 0) throw new Error("Nenhum card válido no arquivo")
            const { error } = await supabase.from("cards").insert(valid)
            if (error) throw error
            return { imported: valid.length, skipped: skippedTitles.length, skippedTitles }
        },
        onSuccess: invalidate,
    })

    const createCard = (form: CardForm) =>
        withToast(() => createMutation.mutateAsync(form), {
            loading: "Criando card...",
            success: "Card criado",
            error: "Não foi possível criar o card",
        })

    const updateCard = async (id: string, form: CardForm) =>
        !!(await withToast(() => updateMutation.mutateAsync({ id, form }), {
            loading: "Salvando card...",
            success: "Card atualizado",
            error: "Não foi possível salvar o card",
        }))

    const archiveCard = async (id: string, archived: boolean) =>
        !!(await withToast(() => archiveMutation.mutateAsync({ id, archived }), {
            loading: archived ? "Arquivando card..." : "Restaurando card...",
            success: archived ? "Card arquivado" : "Card restaurado",
            error: archived ? "Não foi possível arquivar o card" : "Não foi possível restaurar o card",
        }))

    const pinCard = async (id: string, pinned: boolean) =>
        !!(await withToast(() => pinMutation.mutateAsync({ id, pinned }), {
            loading: pinned ? "Fixando card..." : "Soltando card...",
            success: pinned ? "Card fixado no topo" : "Card solto",
            error: (error) =>
                error instanceof PinLimitError
                    ? `Você pode fixar até ${PIN_LIMIT} cards. Solte um para fixar este.`
                    : pinned
                      ? "Não foi possível fixar o card"
                      : "Não foi possível soltar o card",
        }))

    const deleteCard = async (id: string) =>
        !!(await withToast(() => deleteMutation.mutateAsync(id), {
            loading: "Removendo card...",
            success: "Card removido",
            error: "Não foi possível remover o card",
        }))

    // Devolve quantos entraram e quantos foram ignorados, ou null se nada pôde ser importado.
    const importCards = (raw: unknown[]) =>
        withToast(() => importMutation.mutateAsync(raw), {
            loading: "Importando cards...",
            success: "Cards importados",
            error: "Não foi possível importar: confira se o arquivo tem cards válidos",
        })

    // Todos os cards (só os 4 campos, sem id) para o arquivo de exportação; null em caso de erro.
    const exportCards = () =>
        withToast(fetchAllForExport, {
            loading: "Preparando arquivo...",
            success: "Cards exportados",
            error: "Não foi possível exportar os cards",
        })

    return {
        cards,
        total,
        // Só é false depois da primeira resposta: até lá a tela mostra esqueleto, nunca "sem cards".
        loading: !!params && list.isPending,
        // true enquanto busca de novo (nova busca, aba ou atualização), sem contar o "carregar mais"
        fetching: list.isFetching && !list.isFetchingNextPage,
        hasNextPage: list.hasNextPage,
        loadingMore: list.isFetchingNextPage,
        fetchNextPage: list.fetchNextPage,
        saving: createMutation.isPending || updateMutation.isPending,
        // Qual card está com fixar/arquivar/apagar em andamento (null = nenhum): a tela trava e mostra o spinner nele.
        pinningId: pinMutation.isPending ? (pinMutation.variables?.id ?? null) : null,
        archivingId: archiveMutation.isPending ? (archiveMutation.variables?.id ?? null) : null,
        deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
        createCard,
        updateCard,
        archiveCard,
        pinCard,
        deleteCard,
        importCards,
        exportCards,
    }
}
