// Pergunta, logo após o login, se a pessoa quer trazer os cards da versão antiga do app (guardados neste navegador).
import { ConfirmActionDialog } from "@/components/confirm-action-dialog"

type Props = {
    open: boolean
    count: number
    onClose: () => void
    onImport: () => Promise<boolean>
}

export function LegacyImportDialog({ open, count, onClose, onImport }: Props) {
    const noun = count === 1 ? "card salvo" : "cards salvos"
    return (
        <ConfirmActionDialog
            open={open}
            onOpenChange={(next) => !next && onClose()}
            title="Importar seus cards antigos?"
            description={
                <>
                    Encontramos {count} {noun} neste navegador pela versão anterior do app. Eles serão adicionados à sua
                    conta, e nada é apagado daqui. Você também pode importar depois, pelo menu da conta.
                </>
            }
            confirmLabel={count === 1 ? "Importar 1 card" : `Importar ${count} cards`}
            busyLabel="Importando..."
            cancelLabel="Agora não"
            onConfirm={onImport}
        />
    )
}
