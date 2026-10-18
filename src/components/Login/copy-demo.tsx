// Demonstração animada do app na tela de login: um cursor clica numa linha e o texto é "copiado".
import { CheckCircleIcon, CheckIcon, MessageCircleIcon, PhoneIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { bouncySpring, softSpring } from "@/lib/motion"

const samples = [
    { icon: PhoneIcon, title: "Saudação inicial", text: "Olá, tudo bem? Meu nome é…" },
    { icon: MessageCircleIcon, title: "Contorno: preço alto", text: "Entendo! Posso te mostrar como…" },
    { icon: CheckCircleIcon, title: "Confirmação de dados", text: "Perfeito! Vou confirmar seus dados…" },
]

// Medidas fixas: o cursor se posiciona sozinho e precisa saber onde cada linha está.
const PADDING = 12
const ROW_HEIGHT = 64
const ROW_GAP = 8
const rowCenter = (index: number) => PADDING + index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2

type CursorProps = { y: number; tick: number }

function Cursor({ y, tick }: CursorProps) {
    return (
        <motion.div
            className="pointer-events-none absolute top-0 left-[58%] z-10"
            initial={false}
            animate={{ y }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
            {/* O clique é reanimado a cada troca de linha (key) */}
            <motion.div
                key={tick}
                animate={{ scale: [1, 1, 0.82, 1] }}
                transition={{ duration: 0.7, times: [0, 0.5, 0.65, 1] }}
            >
                <motion.span
                    key={`ripple-${tick}`}
                    className="absolute -top-2 -left-2 size-6 rounded-full bg-primary-foreground"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 0, 1.8], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                />
                <svg
                    viewBox="0 0 24 24"
                    className="relative size-6 drop-shadow-md"
                    fill="white"
                    stroke="#0c4a6e"
                    strokeWidth="1.5"
                    aria-hidden="true"
                >
                    <path d="M5 3l14 8-6 2-3 6L5 3z" strokeLinejoin="round" />
                </svg>
            </motion.div>
        </motion.div>
    )
}

export function CopyDemo() {
    const reduceMotion = useReducedMotion()
    const [active, setActive] = useState(0)
    const [tick, setTick] = useState(0)

    useEffect(() => {
        if (reduceMotion) return
        const timer = setInterval(() => {
            setActive((current) => (current + 1) % samples.length)
            setTick((current) => current + 1)
        }, 2600)
        return () => clearInterval(timer)
    }, [reduceMotion])

    return (
        <div
            aria-hidden="true"
            className="relative w-full max-w-md rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 shadow-2xl shadow-black/10 backdrop-blur-sm"
            style={{ padding: PADDING }}
        >
            <ul className="grid grid-cols-[minmax(0,1fr)]" style={{ gap: ROW_GAP }}>
                {samples.map(({ icon: Icon, title, text }, index) => {
                    const isActive = index === active
                    return (
                        <li
                            key={title}
                            className="relative flex items-center gap-3 rounded-xl px-3"
                            style={{ height: ROW_HEIGHT }}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="demo-highlight"
                                    className="absolute inset-0 rounded-xl bg-primary-foreground/15"
                                    transition={softSpring}
                                />
                            )}
                            <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-primary-foreground/15">
                                <Icon className="size-4" />
                            </span>
                            {/* pr fixo reserva o espaço do selo, então o texto nunca muda de largura */}
                            <span className="relative min-w-0 flex-1 pr-24">
                                <span className="block truncate font-medium text-sm">{title}</span>
                                <span className="block truncate font-mono text-xs opacity-60">{text}</span>
                            </span>
                            <AnimatePresence>
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.6, x: 10 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ ...bouncySpring, delay: reduceMotion ? 0 : 0.55 }}
                                        className="absolute right-3 flex items-center gap-1 rounded-full bg-primary-foreground px-2.5 py-1 font-medium text-primary text-xs"
                                    >
                                        <CheckIcon className="size-3" />
                                        Copiado
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </li>
                    )
                })}
            </ul>
            {/* -3: a ponta da seta fica em (5, 3) do ícone, então sobe um pouco para a ponta cair no centro da linha */}
            {!reduceMotion && <Cursor y={rowCenter(active) - 3} tick={tick} />}
        </div>
    )
}
