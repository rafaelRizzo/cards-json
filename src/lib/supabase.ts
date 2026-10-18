// Cliente único do Supabase (URL e chave pública vêm do .env; a segurança dos dados fica no RLS, não na chave).
import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
    // Sem isso a tela fica em branco (o erro acontece antes do React montar); só texto fixo, nada vindo de fora.
    document.body.innerHTML =
        '<main style="font-family:system-ui;max-width:32rem;margin:20vh auto;padding:1.5rem;line-height:1.5">' +
        "<h1>Falta configurar o Supabase</h1>" +
        "<p>Preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> no arquivo <code>.env</code> " +
        "e reinicie o <code>pnpm dev</code>.</p></main>"
    throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env (veja o .env.example)")
}

// PKCE: o Google devolve um ?code= de uso único (trocado por sessão com o code_verifier guardado no navegador) em vez de
// um token solto na URL (fluxo implícito, o padrão do supabase-js). Também deixa a URL limpa depois do login (sem o "#").
export const supabase = createClient(url, publishableKey, { auth: { flowType: "pkce" } })
