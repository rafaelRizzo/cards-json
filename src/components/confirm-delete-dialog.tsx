// Confirmação genérica de ação destrutiva (excluir, bloquear): diz exatamente o efeito e trava o botão enquanto roda.
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: React.ReactNode
    confirmLabel?: string
    busyLabel?: string
    onConfirm: () => Promise<boolean>
    children?: React.ReactNode
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "Excluir",
    busyLabel = "Excluindo...",
    onConfirm,
    children,
}: Props) {
    const [busy, setBusy] = useState(false)

    const handleConfirm = async () => {
        setBusy(true)
        const ok = await onConfirm()
        setBusy(false)
        if (ok) onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
                    {/* Vermelho sólido: é o passo final e irreversível, precisa pesar mais que o "Cancelar" */}
                    <Button
                        variant="destructive"
                        disabled={busy}
                        onClick={handleConfirm}
                        className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/90 dark:text-neutral-950 dark:hover:bg-destructive"
                    >
                        {busy ? busyLabel : confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
