// Tipos das variáveis de ambiente de build do Vite.
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
