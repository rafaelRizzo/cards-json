// Painel da direita quando não há card para mostrar: lista vazia (convida a criar), arquivados vazio ou busca sem resultado.
import { PlusIcon, SearchXIcon } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import type { CardView } from "@/hooks/use-cards"
import { fadeUp, staggerContainer } from "@/lib/motion"

type Props = { view: CardView; hasCards: boolean; searchTerm: string; onCreate: () => void }

export function EmptyPreview({ view, hasCards, searchTerm, onCreate }: Props) {
    const searching = hasCards && searchTerm !== ""
    const archivedEmpty = view === "archived" && !searching

    return (
        <motion.div
            variants={staggerContainer(0.09)}
            initial="hidden"
            animate="show"
            className="grid h-full place-items-center p-8 text-center"
        >
            <div className="max-w-xs">
                <motion.span
                    variants={fadeUp}
                    className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"
                >
                    <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                        {searching ? <SearchXIcon /> : <PlusIcon />}
                    </motion.span>
                </motion.span>
                <motion.h2 variants={fadeUp} className="mt-4 font-semibold text-xl">
                    {searching ? "Nada encontrado" : archivedEmpty ? "Nenhum card arquivado" : "Crie seu primeiro card"}
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-1.5 text-muted-foreground text-sm">
                    {searching
                        ? `Nenhum card combina com “${searchTerm}”. Tente outra palavra ou limpe a busca.`
                        : archivedEmpty
                          ? "Os cards que você arquivar ficam guardados aqui, e você pode restaurá-los quando quiser."
                          : "Guarde um texto que você usa com frequência e copie com um clique."}
                </motion.p>
                {!searching && !archivedEmpty && (
                    <motion.div variants={fadeUp} className="mt-5">
                        <Button onClick={onCreate}>
                            <PlusIcon />
                            Criar card
                        </Button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
