// Confirmação genérica de ação reversível (ex.: arquivar): botão neutro, diz o efeito e trava enquanto roda.
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
    confirmLabel: string
    busyLabel: string
    cancelLabel?: string
    onConfirm: () => Promise<boolean>
}

export function ConfirmActionDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    busyLabel,
    cancelLabel = "Cancelar",
    onConfirm,
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
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
                    <Button disabled={busy} onClick={handleConfirm}>
                        {busy ? busyLabel : confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
