// Tooltip de uma linha sobre o Tooltip do shadcn: envolve um elemento clicável e mostra o rótulo ao passar o mouse ou focar.
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
    label: string
    // Precisa ser UM elemento que aceite props de DOM (botão, motion.button...): ele vira o gatilho do tooltip.
    children: React.ReactElement
    side?: "top" | "bottom" | "left" | "right"
}

export function Tip({ label, children, side = "top" }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger render={children} />
            <TooltipContent side={side}>{label}</TooltipContent>
        </Tooltip>
    )
}
