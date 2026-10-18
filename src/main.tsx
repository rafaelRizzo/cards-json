// Entry point: cria o router com a árvore de rotas gerada e monta o app.
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { auth } from "./lib/auth"
import { queryClient } from "./lib/query-client"
import { routeTree } from "./routeTree.gen"
import "./index.css"

// Na volta do Google, troca o ?code= da URL por sessão ANTES de o roteador montar (ele não pode mexer na URL antes disso).
await auth.getSession()

const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
})

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const root = document.getElementById("root")
if (!root) throw new Error("Elemento #root não encontrado")

createRoot(root).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
