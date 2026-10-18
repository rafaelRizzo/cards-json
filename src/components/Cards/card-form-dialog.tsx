// Dialog de criar/editar card: campos à esquerda, prévia ao vivo à direita; só o miolo rola (DialogBody).
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { motion } from "motion/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type Card, type CardForm, CONTENT_MAX, cardFormSchema, TITLE_MAX } from "@/hooks/use-cards"
import { hoverSpring } from "@/lib/motion"
import { CardLivePreview } from "./card-live-preview"
import { ColorPicker } from "./color-picker"
import { FieldFooter } from "./field-footer"
import { IconPicker } from "./icon-picker"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    // null = criando um card novo
    card: Card | null
    saving: boolean
    onSubmit: (form: CardForm) => Promise<void>
}

const emptyForm: CardForm = { title: "", content: "", icon: "FlameIcon", color: "red" }

export function CardFormDialog({ open, onOpenChange, card, saving, onSubmit }: Props) {
    const isEditing = card !== null
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CardForm>({ resolver: zodResolver(cardFormSchema), defaultValues: emptyForm, mode: "onChange" })

    useEffect(() => {
        if (open)
            reset(card ? { title: card.title, content: card.content, icon: card.icon, color: card.color } : emptyForm)
    }, [open, card, reset])

    const [title, content, icon, color] = watch(["title", "content", "icon", "color"])
    const overLimit = title.length > TITLE_MAX || content.length > CONTENT_MAX

    // Ctrl/Cmd + Enter salva sem tirar a mão do teclado.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            handleSubmit(onSubmit)()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="contents">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{isEditing ? "Editar card" : "Novo card"}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Mude o que precisar. A prévia mostra como o card vai ficar."
                                : "Escreva o texto que você quer copiar com um clique."}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogBody className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem]">
                        <div className="md:order-2">
                            <CardLivePreview title={title} content={content} icon={icon} color={color} />
                        </div>

                        <div className="grid content-start gap-5 md:order-1">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Título</Label>
                                <Input
                                    id="title"
                                    autoComplete="off"
                                    placeholder="Ex.: Saudação inicial"
                                    aria-invalid={!!errors.title}
                                    aria-describedby="title-footer"
                                    {...register("title")}
                                />
                                <FieldFooter
                                    id="title-footer"
                                    hint={`Uma linha, até ${TITLE_MAX} caracteres`}
                                    error={errors.title?.message}
                                    length={title.length}
                                    max={TITLE_MAX}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Texto</Label>
                                <Textarea
                                    id="content"
                                    className="field-sizing-fixed h-44 resize-none overflow-y-auto font-mono"
                                    placeholder="Cole ou escreva o texto que será copiado"
                                    aria-invalid={!!errors.content}
                                    aria-describedby="content-footer"
                                    {...register("content")}
                                />
                                <FieldFooter
                                    id="content-footer"
                                    hint={`Até ${CONTENT_MAX.toLocaleString("pt-BR")} caracteres; as quebras de linha são mantidas`}
                                    error={errors.content?.message}
                                    length={content.length}
                                    max={CONTENT_MAX}
                                />
                            </div>

                            <ColorPicker value={color} onChange={(next) => setValue("color", next)} />
                            <IconPicker value={icon} color={color} onChange={(next) => setValue("icon", next)} />
                        </div>
                    </DialogBody>

                    <DialogFooter className="sm:items-center sm:justify-between">
                        <p className="hidden text-muted-foreground text-xs sm:block">
                            <kbd className="rounded border bg-muted px-1 font-mono">Ctrl</kbd> +{" "}
                            <kbd className="rounded border bg-muted px-1 font-mono">Enter</kbd> para salvar
                        </p>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} transition={hoverSpring}>
                                <Button type="submit" disabled={saving || overLimit} className="w-full">
                                    {saving && <Loader2Icon className="animate-spin" />}
                                    {isEditing ? "Salvar alterações" : "Criar card"}
                                </Button>
                            </motion.div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
