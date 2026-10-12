// Springs e variantes compartilhados, para o app inteiro ter o mesmo "toque" de movimento.
import type { Transition, Variants } from "motion/react"

export const spring: Transition = { type: "spring", stiffness: 420, damping: 30 }
export const softSpring: Transition = { type: "spring", stiffness: 260, damping: 26 }
// Para hover/tap de botões: rápida e sem ricochete (a bouncySpring passa do ponto e volta, e isso aparece como um "pulinho").
export const hoverSpring: Transition = { type: "spring", stiffness: 600, damping: 45 }
export const bouncySpring: Transition = { type: "spring", stiffness: 520, damping: 18 }

export const staggerContainer = (stagger = 0.07, delayChildren = 0): Variants => ({
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
})

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: softSpring },
}

export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1, transition: bouncySpring },
}
