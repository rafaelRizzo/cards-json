// Oferta de importar os cards do app antigo guardados neste navegador (localStorage), uma vez por conta.
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useCards } from "@/hooks/use-cards"
import { useSession } from "@/hooks/use-session"
import { describeSkipped } from "@/lib/cards-file"
import { coerceLegacyCard, readLegacyCards, readLegacyStatus, writeLegacyStatus } from "@/lib/legacy-cards"

export function useLegacyImport() {
    const userId = useSession()?.user.id
    const { importCards } = useCards()
    // Lido uma vez ao abrir: o app antigo não existe mais para escrever novos cards.
    const legacy = useMemo(() => readLegacyCards().filter((card) => coerceLegacyCard(card) !== null), [])
    const [status, setStatus] = useState(() => (userId ? readLegacyStatus(userId) : "done"))
    const [open, setOpen] = useState(() => legacy.length > 0 && status === null)

    // Fechar sem importar só dispensa a pergunta; o item do menu continua disponível.
    const close = () => {
        setOpen(false)
        if (!userId || readLegacyStatus(userId) === "done") return
        writeLegacyStatus(userId, "dismissed")
        setStatus("dismissed")
    }

    const importLegacy = async () => {
        const result = await importCards(legacy)
        if (!result || !userId) return false
        writeLegacyStatus(userId, "done")
        setStatus("done")
        if (result.skipped > 0) toast.warning(describeSkipped(result))
        return true
    }

    return {
        count: legacy.length,
        // Mostra o item do menu enquanto houver o que importar e ainda não tiver sido importado.
        pending: legacy.length > 0 && status !== "done",
        open,
        openDialog: () => setOpen(true),
        close,
        importLegacy,
    }
}
