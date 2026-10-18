// Layout autenticado (rota sem path): guarda de sessão e cabeçalho fixo; tudo dentro de /_app exige login.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppHeader } from "@/components/Dashboard/app-header"
import { auth } from "@/lib/auth"

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        // Guarda onde o usuário queria ir: depois do login ele volta pra lá (ex.: um link compartilhado).
        if (!(await auth.getSession())) throw redirect({ to: "/login", search: { redirect: location.href } })
    },
    component: AppLayout,
})

// O cabeçalho mora aqui (e não em cada página) para não remontar nem repetir a animação de entrada ao trocar de rota.
// A página rola dentro da área abaixo dele; o dashboard ocupa essa área inteira e rola por dentro.
function AppLayout() {
    return (
        <div className="flex h-dvh flex-col">
            <AppHeader />
            <div className="min-h-0 flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    )
}
