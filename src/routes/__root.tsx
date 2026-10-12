// Rota raiz: providers globais (Query, tema, tooltip, Motion), Toaster e telas de erro/404.
import type { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { createRootRouteWithContext, type ErrorComponentProps, Link, Outlet } from "@tanstack/react-router"
import { MotionConfig } from "motion/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

type RouterContext = { queryClient: QueryClient }

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
    notFoundComponent: NotFound,
    errorComponent: RootError,
})

function RootLayout() {
    const { queryClient } = Route.useRouteContext()
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                {/* reducedMotion="user": animações somem pra quem pediu menos movimento no sistema. */}
                <MotionConfig reducedMotion="user">
                    <TooltipProvider delay={250}>
                        <Outlet />
                        <Toaster position="top-right" offset={{ top: 64, right: 16 }} richColors />
                    </TooltipProvider>
                </MotionConfig>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

function NotFound() {
    return (
        <main className="grid min-h-dvh place-items-center p-6 text-center">
            <div className="space-y-4">
                <p className="font-mono text-muted-foreground text-sm">404</p>
                <h1 className="font-semibold text-3xl">Essa página não existe</h1>
                <Button nativeButton={false} render={<Link to="/" />}>
                    Voltar pros cards
                </Button>
            </div>
        </main>
    )
}

function RootError({ error }: ErrorComponentProps) {
    return (
        <main className="grid min-h-dvh place-items-center p-6 text-center">
            <div className="max-w-md space-y-4">
                <h1 className="font-semibold text-3xl">Algo quebrou nesta tela</h1>
                <p className="text-muted-foreground text-sm">
                    {error instanceof Error ? error.message : "Erro inesperado"}
                </p>
                <Button onClick={() => window.location.reload()}>Recarregar a página</Button>
            </div>
        </main>
    )
}
