// Dialog de compartilhar um card por link: escolhe a validade, cria, copia, gera outro e desativa.
import { CheckIcon, CopyIcon, Loader2Icon, RefreshCwIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { buildShareLink, isShareExpired, SHARE_VALIDITY_OPTIONS, useCardShares } from "@/hooks/use-card-shares"
import type { Card } from "@/hooks/use-cards"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
    // null = fechado
    card: Card | null
    onOpenChange: (open: boolean) => void
}

export function ShareCardDialog({ card, onOpenChange }: Props) {
    const { findShare, shareCard, unshareCard } = useCardShares()
    const [days, setDays] = useState(7)
    const [busy, setBusy] = useState<"create" | null>(null)
    const [copied, setCopied] = useState(false)
    const [confirmingRemove, setConfirmingRemove] = useState(false)
    // Guarda o último card para o conteúdo não esvaziar durante a animação de fechar.
    const [shown, setShown] = useState(card)

    useEffect(() => {
        if (card) setShown(card)
    }, [card])

    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 1800)
        return () => clearTimeout(timer)
    }, [copied])

    const share = shown ? findShare(shown.id) : undefined
    const active = share && !isShareExpired(share) ? share : undefined
    const link = active ? buildShareLink(active.token) : ""

    const handleCreate = async () => {
        if (!shown) return
        setBusy("create")
        await shareCard(shown.id, days)
        setBusy(null)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
        } catch {
            toast.error("Não foi possível copiar. Selecione o link e copie manualmente.")
        }
    }

    return (
        <>
            <Dialog open={card !== null} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Compartilhar card</DialogTitle>
                        <DialogDescription className="truncate">{shown?.title}</DialogDescription>
                    </DialogHeader>

                    <DialogBody className="grid gap-5">
                        {active && (
                            <div className="grid gap-2">
                                <p className="font-medium text-sm">Link ativo</p>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={link}
                                        aria-label="Link de compartilhamento"
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <Button type="button" variant="outline" onClick={handleCopy}>
                                        {copied ? <CheckIcon /> : <CopyIcon />}
                                        {copied ? "Copiado" : "Copiar"}
                                    </Button>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Vale até {formatDateTime(active.expiresAt)}.
                                </p>
                            </div>
                        )}

                        {share && !active && (
                            <p className="rounded-lg border bg-muted/40 p-3 text-muted-foreground text-sm">
                                O link anterior expirou em {formatDateTime(share.expiresAt)}. Crie um novo para voltar a
                                compartilhar.
                            </p>
                        )}

                        <div className="grid gap-2">
                            <p className="font-medium text-sm">
                                {active ? "Gerar um novo link com validade de" : "Validade do link"}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {SHARE_VALIDITY_OPTIONS.map((option) => (
                                    <button
                                        key={option.days}
                                        type="button"
                                        aria-pressed={days === option.days}
                                        onClick={() => setDays(option.days)}
                                        className={cn(
                                            "rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                                            days === option.days
                                                ? "border-primary bg-accent font-medium text-accent-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {active && (
                                <p className="text-muted-foreground text-xs">
                                    O link atual deixa de funcionar assim que você gerar outro.
                                </p>
                            )}
                        </div>

                        <p className="text-muted-foreground text-xs">
                            Só quem estiver logado consegue abrir o link, e ele para de funcionar quando vence ou quando
                            você o desativa. Se o texto tiver dados pessoais ou de clientes, prefira não compartilhar.
                        </p>
                    </DialogBody>

                    <DialogFooter className="sm:justify-between">
                        {active ? (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={busy !== null}
                                onClick={() => setConfirmingRemove(true)}
                            >
                                Desativar link
                            </Button>
                        ) : (
                            <DialogClose render={<Button type="button" variant="outline" />}>Fechar</DialogClose>
                        )}
                        <Button type="button" disabled={busy !== null} onClick={handleCreate}>
                            {busy === "create" ? <Loader2Icon className="animate-spin" /> : active && <RefreshCwIcon />}
                            {active ? "Gerar novo link" : "Criar link"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={confirmingRemove}
                onOpenChange={setConfirmingRemove}
                title="Desativar link"
                description="Quem tiver o link deixa de conseguir abrir este card. Você pode criar outro depois."
                confirmLabel="Desativar"
                busyLabel="Desativando..."
                onConfirm={() => (shown ? unshareCard(shown.id) : Promise.resolve(false))}
            />
        </>
    )
}
