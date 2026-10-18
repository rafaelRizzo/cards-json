// Compartilhamento por link: meus links ativos, criar/desativar (funções do banco) e abrir um card pelo token.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useSession } from "@/hooks/use-session"
import { withToast } from "@/lib/mutation"
import { supabase } from "@/lib/supabase"

// O banco aceita de 1 a 90 dias; a tela oferece só estes.
export const SHARE_VALIDITY_OPTIONS = [
    { days: 1, label: "1 dia" },
    { days: 7, label: "7 dias" },
    { days: 30, label: "30 dias" },
] as const

// card: o suficiente para listar o link sem precisar da lista de cards (que agora é paginada).
export type CardShare = {
    cardId: string
    token: string
    expiresAt: string
    card: { title: string; icon: string; color: string }
}

const shareRowSchema = z
    .object({
        card_id: z.string(),
        token: z.string(),
        expires_at: z.string(),
        cards: z.object({ title: z.string(), icon: z.string(), color: z.string() }),
    })
    .transform(
        (row): CardShare => ({ cardId: row.card_id, token: row.token, expiresAt: row.expires_at, card: row.cards }),
    )

// O que a função share_card devolve (sem os dados do card; depois de criar, a lista é buscada de novo).
const createdShareSchema = z.object({ card_id: z.string(), token: z.string(), expires_at: z.string() })

export type SharedCard = { title: string; content: string; icon: string; color: string; expiresAt: string }

const sharedCardSchema = z
    .object({ title: z.string(), content: z.string(), icon: z.string(), color: z.string(), expires_at: z.string() })
    .transform(({ expires_at, ...card }): SharedCard => ({ ...card, expiresAt: expires_at }))

export const buildShareLink = (token: string) => `${window.location.origin}/s/${token}`

export const isShareExpired = (share: CardShare) => new Date(share.expiresAt).getTime() <= Date.now()

const fetchShares = async (): Promise<CardShare[]> => {
    const { data, error } = await supabase
        .from("card_shares")
        .select("card_id, token, expires_at, cards(title, icon, color)")
    if (error) throw error
    return z.array(shareRowSchema).parse(data)
}

export function useCardShares() {
    const queryClient = useQueryClient()
    const userId = useSession()?.user.id
    const cacheKey = ["card-shares", userId]
    const { data: shares = [], isLoading: loading } = useQuery({
        queryKey: cacheKey,
        queryFn: fetchShares,
        enabled: !!userId,
        staleTime: 5 * 60_000,
    })

    const patchCache = (change: (current: CardShare[]) => CardShare[]) =>
        queryClient.setQueryData<CardShare[]>(cacheKey, (current) => change(current ?? []))

    const shareMutation = useMutation({
        mutationFn: async ({ cardId, days }: { cardId: string; days: number }) => {
            const { data, error } = await supabase.rpc("share_card", { p_card_id: cardId, p_days: days })
            if (error) throw error
            return createdShareSchema.parse(data)
        },
        // Busca a lista de novo (traz os dados do card junto); gerar outro link também troca o token do mesmo card.
        // Retornar a promessa faz o toast de sucesso só aparecer com a lista já atualizada.
        onSuccess: () => queryClient.invalidateQueries({ queryKey: cacheKey }),
    })
    const unshareMutation = useMutation({
        mutationFn: async (cardId: string) => {
            const { error } = await supabase.rpc("unshare_card", { p_card_id: cardId })
            if (error) throw error
            return cardId
        },
        onSuccess: (cardId) => patchCache((current) => current.filter((item) => item.cardId !== cardId)),
    })

    const shareCard = (cardId: string, days: number) =>
        withToast(() => shareMutation.mutateAsync({ cardId, days }), {
            loading: "Criando link...",
            success: "Link criado",
            error: "Não foi possível criar o link",
        })

    const unshareCard = async (cardId: string) =>
        !!(await withToast(() => unshareMutation.mutateAsync(cardId), {
            loading: "Desativando link...",
            success: "Link desativado",
            error: "Não foi possível desativar o link",
        }))

    const findShare = (cardId: string) => shares.find((share) => share.cardId === cardId)

    return { shares, loading, findShare, shareCard, unshareCard }
}

// Abre o card de um link: null = inválido, vencido ou desativado (o banco não diferencia, de propósito).
export function useSharedCard(token: string) {
    const userId = useSession()?.user.id
    return useQuery({
        queryKey: ["shared-card", userId, token],
        enabled: !!userId,
        retry: false,
        staleTime: 60_000,
        queryFn: async (): Promise<SharedCard | null> => {
            if (!z.uuid().safeParse(token).success) return null
            const { data, error } = await supabase.rpc("get_shared_card", { p_token: token })
            if (error) throw error
            const [row] = z.array(sharedCardSchema).parse(data)
            return row ?? null
        },
    })
}
