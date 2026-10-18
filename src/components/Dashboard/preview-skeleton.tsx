// Painel da direita enquanto a lista ainda carrega: mesmo formato da prévia, para a tela não pular nem dizer "vazio".
import { Skeleton } from "@/components/ui/skeleton"

export function PreviewSkeleton() {
    return (
        <div className="flex h-full min-h-0 flex-col" role="status" aria-label="Carregando card">
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-12 rounded-xl" />
                    <div className="grid gap-2">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                </div>
            </div>
            <div className="min-h-0 flex-1 px-6">
                <Skeleton className="h-28 w-full rounded-xl" />
            </div>
            <div className="p-6 pt-4">
                <Skeleton className="h-9 w-full rounded-lg" />
            </div>
        </div>
    )
}
