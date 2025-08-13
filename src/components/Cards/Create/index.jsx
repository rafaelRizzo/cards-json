import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

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

import {
    HeartIcon,
    DotIcon,
    GhostIcon,
    LightbulbIcon,
    FlameIcon,
} from "lucide-react";
import { toast } from "sonner";

const iconMap = {
    FlameIcon: FlameIcon,
    LightbulbIcon: LightbulbIcon,
    HeartIcon: HeartIcon,
    GhostIcon: GhostIcon,
    DotIcon: DotIcon,
};

const colors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
    "gray",
    "zinc",
    "neutral",
    "stone",
];

const iconColorClassMap = {
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

const colorClassMap = {
    red: "bg-red-500 dark:bg-red-600",
    orange: "bg-orange-500 dark:bg-orange-600",
    amber: "bg-amber-500 dark:bg-amber-600",
    yellow: "bg-yellow-500 dark:bg-yellow-600",
    lime: "bg-lime-500 dark:bg-lime-600",
    green: "bg-green-500 dark:bg-green-600",
    emerald: "bg-emerald-500 dark:bg-emerald-600",
    teal: "bg-teal-500 dark:bg-teal-600",
    cyan: "bg-cyan-500 dark:bg-cyan-600",
    sky: "bg-sky-500 dark:bg-sky-600",
    blue: "bg-blue-500 dark:bg-blue-600",
    indigo: "bg-indigo-500 dark:bg-indigo-600",
    violet: "bg-violet-500 dark:bg-violet-600",
    purple: "bg-purple-500 dark:bg-purple-600",
    fuchsia: "bg-fuchsia-500 dark:bg-fuchsia-600",
    pink: "bg-pink-500 dark:bg-pink-600",
    rose: "bg-rose-500 dark:bg-rose-600",
    gray: "bg-gray-500 dark:bg-gray-600",
    zinc: "bg-zinc-500 dark:bg-zinc-600",
    neutral: "bg-neutral-500 dark:bg-neutral-600",
    stone: "bg-stone-500 dark:bg-stone-600",
};

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

export default function CreateCard({ addCard }) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            title: "",
            content: "",
            icon: "FlameIcon",
            color: "red",
        },
    });

    const selectedIcon = watch("icon");
    const selectedColor = watch("color");

    const IconComponent = iconMap[selectedIcon];

    const onSubmit = (data) => {
        toast.dismiss();
        const newCard = { id: Date.now(), ...data };
        const toast_loading = toast.loading("Criando card...");
        addCard(newCard);
        toast.dismiss(toast_loading);
        toast.success("Card criado com sucesso!");
        reset();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="flex items-center gap-1
                        bg-fuchsia-500 hover:bg-fuchsia-600
                        focus:ring-fuchsia-600/40
                        dark:bg-fuchsia-600 hover:dark:bg-fuchsia-700
                        dark:focus:ring-fuchsia-600/40"
                >
                    <PlusIcon size={16} />
                    <span>Criar card</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl max-h-full overflow-auto p-0">
                <DialogHeader className="p-5 dark:bg-zinc-900">
                    <DialogTitle className="text-center">Criar card</DialogTitle>
                    <DialogDescription className="text-center">
                        Preencha os campos abaixo para criar um novo card.
                    </DialogDescription>
                </DialogHeader>

                {/* Preview do ícone colorido */}
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

                    {/* Seleção de ícones */}
                    <div>
                        <p className="font-bold mb-1">Ícones disponíveis</p>
                        <p className="text-muted-foreground mb-3">
                            Escolha um ícone para seu card
                        </p>
                        <div className="grid md:grid-cols-5 gap-2">
                            {Object.entries(iconMap).map(([key, IconComp]) => (
                                <Card
                                    key={key}
                                    className={`flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800
                                    ${selectedIcon === key
                                            ? "bg-zinc-100 dark:bg-zinc-800"
                                            : null
                                        }`}
                                    onClick={() => setValue("icon", key)}
                                >
                                    <IconComp
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

                    {/* Seleção de cores */}
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

                    <DialogFooter className={"pb-5 px-0 flex gap-3 justify-end"}>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Criar meu card</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
