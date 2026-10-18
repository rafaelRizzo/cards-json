// Fim da lista paginada: busca a próxima página sozinho ao chegar perto do fim (rolagem infinita) e tem o botão de reserva.
import { Loader2Icon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

type Props = { hasMore: boolean; loading: boolean; onLoadMore: () => void }

export function LoadMore({ hasMore, loading, onLoadMore }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    // Sempre a função mais recente, sem refazer o observador a cada render.
    const onLoadMoreRef = useRef(onLoadMore)
    onLoadMoreRef.current = onLoadMore

    useEffect(() => {
        const element = ref.current
        if (!element || !hasMore || loading) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) onLoadMoreRef.current()
            },
            { rootMargin: "160px" },
        )
        observer.observe(element)
        return () => observer.disconnect()
    }, [hasMore, loading])

    if (!hasMore) return null

    return (
        <div ref={ref} className="grid place-items-center py-3">
            <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={onLoadMore}>
                {loading ? <Loader2Icon className="animate-spin" /> : null}
                {loading ? "Carregando…" : "Carregar mais"}
            </Button>
        </div>
    )
}
