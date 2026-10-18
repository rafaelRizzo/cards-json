// Compatibilidade com o app antigo (Next): lê os cards que ele guardava no localStorage e ajusta o que for preciso.
import { colors, iconMap } from "@/lib/icons"

// O app antigo usava o persist do zustand: a chave era esta e o valor `{ "state": { "cards": [...] }, "version": 0 }`.
const LEGACY_STORAGE_KEY = "cards-storage"
const DEFAULT_ICON = "FlameIcon"
const DEFAULT_COLOR = "red"

const field = (value: object, key: string): unknown => Reflect.get(value, key)
const isObject = (value: unknown): value is object => typeof value === "object" && value !== null

// Cards salvos neste navegador pela versão antiga (lista vazia se não houver nada ou se o storage estiver bloqueado).
export const readLegacyCards = (): unknown[] => {
    try {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        // Aceita também uma lista solta, caso o formato do persist mude.
        if (Array.isArray(parsed)) return parsed
        const state = isObject(parsed) ? field(parsed, "state") : null
        const cards = isObject(state) ? field(state, "cards") : null
        return Array.isArray(cards) ? cards : []
    } catch {
        return []
    }
}

// Deixa um card de formato antigo (ou de um arquivo exportado por ele) pronto para o schema novo:
// descarta o id antigo, troca quebra de linha do título por espaço e cai no padrão se ícone/cor não existirem mais.
// O que não tem como consertar sem perder texto (título/conteúdo ausentes ou grandes demais) segue e o schema recusa.
export const coerceLegacyCard = (raw: unknown) => {
    if (!isObject(raw)) return null
    const title = field(raw, "title")
    const content = field(raw, "content")
    const icon = field(raw, "icon")
    const color = field(raw, "color")
    if (typeof title !== "string" || typeof content !== "string") return null
    return {
        title: title.replace(/\s*[\r\n]+\s*/g, " "),
        content,
        icon: typeof icon === "string" && Object.hasOwn(iconMap, icon) ? icon : DEFAULT_ICON,
        color: typeof color === "string" && colors.includes(color) ? color : DEFAULT_COLOR,
    }
}

// Marca por usuário se a oferta de importação já foi resolvida (importou) ou dispensada, para não perguntar de novo.
export type LegacyStatus = "done" | "dismissed"
const statusKey = (userId: string) => `cards-legacy-import:${userId}`

export const readLegacyStatus = (userId: string): LegacyStatus | null => {
    try {
        const value = localStorage.getItem(statusKey(userId))
        return value === "done" || value === "dismissed" ? value : null
    } catch {
        return null
    }
}

export const writeLegacyStatus = (userId: string, status: LegacyStatus) => {
    try {
        localStorage.setItem(statusKey(userId), status)
    } catch {
        // Sem storage: a oferta pode voltar na próxima visita, sem prejuízo.
    }
}
