// QueryClient único do app: sem retry automático e sem refetch ao focar a janela.
import { QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        // Leituras falhando viram um toast só por query (mutations já têm o próprio toast).
        onError: (_error, query) => {
            toast.error("Não foi possível carregar os dados", { id: `query-${query.queryHash}` })
        },
    }),
    defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 },
    },
})
