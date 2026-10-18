// Seletor de ícone: grade compacta sempre visível (troca em um clique); o escolhido leva a moldura da cor do card.
import { Tip } from "@/components/tip"
import { iconLabels, iconMap, tileClass } from "@/lib/icons"
import { cn } from "@/lib/utils"

type Props = { value: string; color: string; onChange: (key: string) => void }

const entries = Object.entries(iconMap)

export function IconPicker({ value, color, onChange }: Props) {
    return (
        <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-sm">Ícone</p>
                <p className="text-muted-foreground text-xs">{iconLabels[value]}</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-0.5 rounded-xl border bg-muted/30 p-1.5">
                {entries.map(([key, Icon]) => {
                    const selected = value === key
                    return (
                        <Tip key={key} label={iconLabels[key]}>
                            <button
                                type="button"
                                aria-label={iconLabels[key]}
                                aria-pressed={selected}
                                onClick={() => onChange(key)}
                                className={cn(
                                    "grid h-9 place-items-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                                    selected
                                        ? cn("ring-1", tileClass(color))
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                            >
                                <Icon className="size-4" />
                            </button>
                        </Tip>
                    )
                })}
            </div>
        </div>
    )
}
