import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { DiOpensource } from "react-icons/di";

export default function Footer() {
    return (
        <footer className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground p-2">
            <div className="flex items-center justify-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DiOpensource size={16} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Esse código é open source!</p>
                    </TooltipContent>
                </Tooltip>
                <a href="https://github.com/rafaelRizzo" target="_blank">Rafael Rizzo</a>
            </div>
        </footer>
    );
}