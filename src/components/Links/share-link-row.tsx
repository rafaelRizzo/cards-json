// Linha da página de links compartilhados: o card, a validade, o link para copiar e o botão de desativar.
import { CheckIcon, CopyIcon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildShareLink, type CardShare, isShareExpired } from "@/hooks/use-card-shares"
import { formatDateTime, formatRelative } from "@/lib/format"
import { CardIconTile } from "@/lib/icons"
import { fadeUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Props = { card: CardShare["card"]; share: CardShare; onRemove: (share: CardShare) => void }

export function ShareLinkRow({ card, share, onRemove }: Props) {
    const [copied, setCopied] = useState(false)
    const expired = isShareExpired(share)
    const link = buildShareLink(share.token)

    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 1800)
        return () => clearTimeout(timer)
    }, [copied])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
        } catch {
            toast.error("Não foi possível copiar. Selecione o link e copie manualmente.")
        }
    }

    return (
        <motion.li layout variants={fadeUp} className="rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
                <CardIconTile
                    icon={card.icon}
                    color={card.color}
                    className="size-10 rounded-lg"
                    iconClassName="size-5"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-medium">{card.title}</h2>
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                expired ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                            )}
                        >
                            {expired ? "Expirado" : "Ativo"}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {expired ? "Expirou" : "Expira"} {formatRelative(share.expiresAt)} ·{" "}
                        {formatDateTime(share.expiresAt)}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemove(share)}
                >
                    {expired ? "Remover" : "Desativar"}
                </Button>
            </div>

            {!expired && (
                <div className="mt-3 flex gap-2">
                    <Input
                        readOnly
                        value={link}
                        aria-label={`Link do card ${card.title}`}
                        className="font-mono text-xs"
                        onFocus={(event) => event.target.select()}
                    />
                    <Button type="button" variant="outline" onClick={handleCopy}>
                        {copied ? <CheckIcon /> : <CopyIcon />}
                        {copied ? "Copiado" : "Copiar"}
                    </Button>
                </div>
            )}
        </motion.li>
    )
}
