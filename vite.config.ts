// Configuração do Vite: React, TanStack Router (rotas file-based geradas em src/routeTree.gen.ts) e Tailwind v4.
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    // strictPort: a URL de redirect do login (Google/Supabase) é cadastrada com essa porta exata.
    server: { port: 5173, strictPort: true },
})
