// Formatação de datas para a tela (pt-BR): absoluta e relativa ("amanhã", "há 3 dias", "daqui a 2 horas").
const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" })
const relativeFormat = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso))

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

// Passado ou futuro, na unidade mais natural (minutos, horas ou dias).
export const formatRelative = (iso: string, now = Date.now()) => {
    const diff = new Date(iso).getTime() - now
    const abs = Math.abs(diff)
    if (abs < HOUR) return relativeFormat.format(Math.round(diff / MINUTE), "minute")
    if (abs < DAY) return relativeFormat.format(Math.round(diff / HOUR), "hour")
    return relativeFormat.format(Math.round(diff / DAY), "day")
}
