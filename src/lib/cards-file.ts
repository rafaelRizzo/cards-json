// Exportar e importar os cards como arquivo JSON (leitura valida só o formato do arquivo).
const MAX_IMPORT_SIZE = 5 * 1024 * 1024

export const exportCardsToFile = (cards: unknown[]) => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cards_${timestamp}.json`
    link.click()
    URL.revokeObjectURL(url)
}

// Texto do aviso para cards que não puderam ser importados (mostra os primeiros títulos para a pessoa achar e ajustar).
export const describeSkipped = ({ skipped, skippedTitles }: { skipped: number; skippedTitles: string[] }) => {
    const shown = skippedTitles
        .slice(0, 3)
        .map((title) => `"${title.length > 30 ? `${title.slice(0, 30)}…` : title}"`)
        .join(", ")
    const more = skipped > 3 ? ` e mais ${skipped - 3}` : ""
    return `${skipped} card(s) ficaram de fora por estarem fora do formato ou dos limites: ${shown}${more}.`
}

// Lê e valida o arquivo; lança Error com mensagem pronta para o toast.
export const readCardsFromFile = async (file: File): Promise<unknown[]> => {
    if (file.type !== "application/json") throw new Error("Selecione um arquivo .json válido.")
    if (file.size > MAX_IMPORT_SIZE) throw new Error("O arquivo é muito grande (máximo 5MB).")

    let data: unknown
    try {
        data = JSON.parse(await file.text())
    } catch {
        throw new Error("Verifique se o arquivo é um JSON válido.")
    }
    if (!Array.isArray(data)) throw new Error("Arquivo inválido: deve ser uma lista de cards.")
    return data
}
