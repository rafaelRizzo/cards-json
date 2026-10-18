// Autenticação via Supabase (login com Google). Expõe uma sessão simples e síncrona para a UI e o guard de rota.
import type { Session as SupabaseSession } from "@supabase/supabase-js"
import { queryClient } from "./query-client"
import { safeRedirect } from "./safe-redirect"
import { supabase } from "./supabase"

// avatarUrl: foto da conta Google (vem no login, não guardamos nada); null se a conta não tiver.
export type Session = { user: { id: string; name: string; email: string; avatarUrl: string | null } }

const listeners = new Set<() => void>()
let session: Session | null = null

const toSession = (raw: SupabaseSession | null): Session | null => {
    if (!raw) return null
    const { id, email, user_metadata } = raw.user
    // Só aceita https: o endereço da foto vem do provedor, mas não vale confiar em qualquer esquema.
    const picture: unknown = user_metadata.avatar_url ?? user_metadata.picture
    const avatarUrl = typeof picture === "string" && picture.startsWith("https://") ? picture : null
    return {
        user: {
            id,
            email: email ?? "",
            name: user_metadata.full_name ?? user_metadata.name ?? email ?? "Usuário",
            avatarUrl,
        },
    }
}

const update = (raw: SupabaseSession | null) => {
    session = toSession(raw)
    for (const listener of listeners) listener()
}

// Não chamar outras funções do supabase dentro deste callback (o client pode travar esperando ele mesmo).
supabase.auth.onAuthStateChange((event, raw) => {
    if (event === "SIGNED_OUT") queryClient.clear()
    update(raw)
})

export const auth = {
    // Espera o client terminar de iniciar: na volta do Google isso inclui trocar o ?code= da URL pela sessão.
    getSession: async () => {
        const { data } = await supabase.auth.getSession()
        update(data.session)
        return session
    },
    getSnapshot: () => session,
    subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    },
    // Redireciona pro Google; quem volta pra `redirectTo` já com sessão é o próprio client (PKCE).
    // redirectPath: página que o usuário queria abrir antes do login (ex.: um link compartilhado).
    signInWithGoogle: async (redirectPath?: string) => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin + safeRedirect(redirectPath) },
        })
        if (error) throw error
    },
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },
}
