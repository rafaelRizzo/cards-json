import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartIcon } from "lucide-react";
import { DotIcon } from "lucide-react";
import { GhostIcon } from "lucide-react";
import { LightbulbIcon } from "lucide-react";
import { FlameIcon } from "lucide-react";
import { toast } from "sonner";

export default function ListCards({ filteredCards }) {
    const handleClickCopy = (data) => {
        navigator.clipboard.writeText(data)
        toast.success('Copiado para a área de transferência!')
    }

    const handlerIcons = (icon, color) => {
        switch (icon) {
            case 'FlameIcon':
                return <FlameIcon className={handlerColors(color)} />;
            case 'LightbulbIcon':
                return <LightbulbIcon className={handlerColors(color)} />
            case 'GhostIcon':
                return <GhostIcon className={handlerColors(color)} />;
            case 'HeartIcon':
                return <HeartIcon className={handlerColors(color)} />;
            default:
                return <DotIcon className={handlerColors(color)} />;
        }
    }

    const handlerColors = (color) => {
        switch (color) {
            case 'red':
                return 'text-red-500 dark:text-red-600';
            case 'blue':
                return 'text-indigo-500 dark:text-indigo-600';
            case 'green':
                return 'text-emerald-500 dark:text-emerald-600';
            default:
                return 'text-gray-500';
        }
    }

    return (
        <>
            {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                    <Card key={card.id} className="hover:cursor-pointer hover:border-zinc-300 hover:dark:border-zinc-700 transition-all select-none" onClick={() => { handleClickCopy(card.content) }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-1.5">
                                {handlerIcons(card.icon, card.color)}
                                <span>{card.title}</span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted-foreground text-sm">Nenhum card encontrado...</p>
            )}
        </>
    )
}