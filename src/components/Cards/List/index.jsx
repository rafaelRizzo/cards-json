import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Delete from "../Delete";
import { handlerIcons } from "../iconUtils";
import EditCard from "../Edit";
import { useCardsStore } from "@/store/useCardsStore";

export default function ListCards({ filteredCards, onDelete }) {
    const updateCard = useCardsStore((state) => state.updateCard);

    const handleClickCopy = (data) => {
        navigator.clipboard.writeText(data);
        toast.success("Copiado para a área de transferência!");
    };

    return (
        <>
            {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                    <abbr key={card.id} title={card.content} className="no-underline cursor-default">
                        <Card
                            className="hover:cursor-pointer hover:border-zinc-300 hover:dark:border-zinc-700 transition-all select-none"
                            onClick={() => handleClickCopy(card.content)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-1.5 truncate">
                                    <div className="flex items-center gap-2 truncate">
                                        <div>{handlerIcons(card.icon, card.color)}</div>
                                        <span>{card.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <EditCard card={card} updateCard={updateCard} />
                                        <Delete card={card} onDelete={onDelete} />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </abbr>
                ))
            ) : (
                <p className="text-center text-muted-foreground text-sm">
                    Nenhum card encontrado...
                </p>
            )}
        </>
    );
}