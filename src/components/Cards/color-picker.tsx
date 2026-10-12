// Seletor de cor do ícone: bolinhas com marcador animado de seleção.
import { CheckIcon } from "lucide-react"
import { motion, type Variants } from "motion/react"
import { Tip } from "@/components/tip"
import { colorClassMap, colorLabels, colors } from "@/lib/icons"
import { bouncySpring, spring, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Props = { value: string; onChange: (color: string) => void }

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.7 },
    show: { opacity: 1, scale: 1, transition: bouncySpring },
}

export function ColorPicker({ value, onChange }: Props) {
    return (
        <div>
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="font-medium text-sm">Cor</p>
            </div>
            <motion.div
                variants={staggerContainer(0.01)}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-2 p-1.5"
            >
                {colors.map((name) => {
                    const selected = value === name
                    return (
                        <Tip key={name} label={colorLabels[name]}>
                            <motion.button
                                type="button"
                                aria-label={`Cor ${colorLabels[name]}`}
                                aria-pressed={selected}
                                variants={itemVariants}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.88 }}
                                onClick={() => onChange(name)}
                                className={cn(
                                    "relative grid size-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    colorClassMap[name],
                                )}
                            >
                                {selected && (
                                    <>
                                        <motion.span
                                            layoutId="color-ring"
                                            transition={spring}
                                            className="absolute -inset-1 rounded-full ring-2 ring-foreground/70"
                                        />
                                        <CheckIcon className="relative size-3 text-white" />
                                    </>
                                )}
                            </motion.button>
                        </Tip>
                    )
                })}
            </motion.div>
        </div>
    )
}
