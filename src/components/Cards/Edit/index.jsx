import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { iconMap, colors, iconColorClassMap, colorClassMap } from "../iconUtils";

const ColorBall = ({ colorName, onClick, selected }) => {
    const colorClass = colorClassMap[colorName] || "bg-gray-500 dark:bg-gray-600";

    return (
        <div
            onClick={onClick}
            className={`${colorClass} w-10 h-10 rounded-full cursor-pointer hover:scale-105 transition-all ${selected ? "ring-2 ring-offset-2 ring-zinc-200 dark:ring-zinc-700" : ""
                }`}
        ></div>
    );
};

export default function EditCard({ card, updateCard, trigger }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            title: card.title,
            content: card.content,
            icon: card.icon,
            color: card.color,
        },
    });

    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    const IconComponent = iconMap[selectedIcon];

    const onSubmit = (data) => {
        toast.dismiss();
        const updatedCard = { ...card, ...data };
        const toast_loading = toast.loading("Salvando alterações...");
        setTimeout(() => {
            toast.dismiss(toast_loading);
            toast.success("Card atualizado com sucesso!");
        }, 100);
        updateCard(updatedCard);
        reset(data);
    };

    const handleOpenChange = (open) => {
        if (open) {
            reset({
                title: card.title,
                content: card.content,
                icon: card.icon,
                color: card.color,
            });
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="outline"
                        className="flex items-center gap-1"
                    >
                        <PencilIcon size={14} />
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl max-h-full overflow-auto p-0">
                <DialogHeader className="p-5 dark:bg-zinc-900">
                    <DialogTitle className="text-center">Editar card</DialogTitle>
                    <DialogDescription className="text-center">
                        Atualize as informações do seu card abaixo.
                    </DialogDescription>
                </DialogHeader>

                <div className="text-6xl mx-auto my-5">
                    {IconComponent && (
                        <IconComponent
                            className={iconColorClassMap[selectedColor] || "text-gray-500"}
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            {...register("title", { required: "Título é obrigatório" })}
                            autoComplete="off"
                            placeholder="Digite o título"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="content">Descrição</Label>
                        <Textarea
                            id="content"
                            {...register("content", { required: "Descrição é obrigatória" })}
                            placeholder="Digite a descrição"
                            rows={3}
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm">{errors.content.message}</p>
                        )}
                    </div>

                    <div>
                        <p className="font-bold mb-1">Ícones disponíveis</p>
                        <p className="text-muted-foreground mb-3">
                            Escolha um ícone para seu card
                        </p>
                        <div className="grid grid-cols-5 md:grid-cols-12 gap-2">
                            {Object.entries(iconMap).map(([key, IconComp]) => (
                                <Card
                                    key={key}
                                    className={`flex items-center justify-center cursor-pointer p-4 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800
                                    ${selectedIcon === key ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
                                    onClick={() => setValue("icon", key)}
                                >
                                    <IconComp
                                        size={18}
                                        className={
                                            selectedColor
                                                ? iconColorClassMap[selectedColor]
                                                : "text-gray-500"
                                        }
                                    />
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="font-bold mb-1">Cores disponíveis</p>
                        <p className="text-muted-foreground mb-3">
                            Escolha uma cor para seu ícone
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {colors.map((colorName) => (
                                <ColorBall
                                    key={colorName}
                                    colorName={colorName}
                                    selected={selectedColor === colorName}
                                    onClick={() => setValue("color", colorName)}
                                />
                            ))}
                        </div>
                    </div>

                    <p className="text-muted-foreground text-xs mx-auto text-center mb-4">
                        Esses dados não ficarão salvos na nossa base de dados apenas no seu
                        navegador, portanto se for um card muito importante não deixe de
                        salvar em outro local!
                    </p>

                    <DialogFooter className="pb-5 px-0 flex gap-3 justify-end">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Salvar alterações</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}