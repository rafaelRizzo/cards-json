import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartIcon, DotIcon, TrashIcon, GhostIcon, LightbulbIcon, FlameIcon } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ListCards({ filteredCards, onDelete }) {
    const handleClickCopy = (data) => {
        navigator.clipboard.writeText(data);
        toast.success("Copiado para a área de transferência!");
    };

    const handlerIcons = (icon, color) => {
        switch (icon) {
            case "FlameIcon":
                return <FlameIcon className={handlerColors(color)} />;
            case "LightbulbIcon":
                return <LightbulbIcon className={handlerColors(color)} />;
            case "GhostIcon":
                return <GhostIcon className={handlerColors(color)} />;
            case "HeartIcon":
                return <HeartIcon className={handlerColors(color)} />;
            default:
                return <DotIcon className={handlerColors(color)} />;
        }
    };

    const handlerColors = (color) => {
        const colorMap = {
            red: "text-red-500 dark:text-red-600",
            orange: "text-orange-500 dark:text-orange-600",
            amber: "text-amber-500 dark:text-amber-600",
            yellow: "text-yellow-500 dark:text-yellow-600",
            lime: "text-lime-500 dark:text-lime-600",
            green: "text-green-500 dark:text-green-600",
            emerald: "text-emerald-500 dark:text-emerald-600",
            teal: "text-teal-500 dark:text-teal-600",
            cyan: "text-cyan-500 dark:text-cyan-600",
            sky: "text-sky-500 dark:text-sky-600",
            blue: "text-blue-500 dark:text-blue-600",
            indigo: "text-indigo-500 dark:text-indigo-600",
            violet: "text-violet-500 dark:text-violet-600",
            purple: "text-purple-500 dark:text-purple-600",
            fuchsia: "text-fuchsia-500 dark:text-fuchsia-600",
            pink: "text-pink-500 dark:text-pink-600",
            rose: "text-rose-500 dark:text-rose-600",
            gray: "text-gray-500 dark:text-gray-600",
            zinc: "text-zinc-500 dark:text-zinc-600",
            neutral: "text-neutral-500 dark:text-neutral-600",
            stone: "text-stone-500 dark:text-stone-600",
        };

        return colorMap[color] || "text-gray-500";
    };

    const handleDelete = (id) => {
        onDelete(id);
        toast.success("Card removido com sucesso!");
    };

    return (
        <>
            {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                    <Card
                        key={card.id}
                        className="hover:cursor-pointer hover:border-zinc-300 hover:dark:border-zinc-700 transition-all select-none"
                        onClick={() => handleClickCopy(card.content)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between gap-1.5 truncate">
                                <div className="flex items-center gap-2 truncate">
                                    <div>{handlerIcons(card.icon, card.color)}</div>
                                    <span>{card.title}</span>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost">
                                                <TrashIcon className="w-4 h-4 text-red-800" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remover Card</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja remover este card? Essa ação não poderá ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-red-600 hover:bg-red-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(card.id);
                                                    }}
                                                >
                                                    Remover
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))
            ) : (
                <p className="text-center text-muted-foreground text-sm">
                    Nenhum card encontrado...
                </p>
            )}
        </>
    );
}
