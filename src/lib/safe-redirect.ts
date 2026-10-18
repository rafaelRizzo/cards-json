// Destino pós-login vindo da URL (?redirect=): só caminho interno, para nunca virar redirecionamento para outro site.
export const safeRedirect = (value: string | undefined) =>
    value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/"
