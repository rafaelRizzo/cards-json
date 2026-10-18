// Tela de login: painel de apresentação com demo animada à esquerda, botão do Google à direita.
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Loader2Icon } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Brand } from "@/components/brand"
import { GoogleIcon } from "@/components/google-icon"
import { CopyDemo } from "@/components/Login/copy-demo"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { fadeUp, hoverSpring, popIn, staggerContainer } from "@/lib/motion"
import { safeRedirect } from "@/lib/safe-redirect"

export const Route = createFileRoute("/login")({
    // redirect: página que o usuário queria abrir antes de ser mandado pro login.
    validateSearch: z.object({ redirect: z.string().optional() }),
    // Quem já está logado não precisa ver o login: vai direto pro destino.
    beforeLoad: async ({ search }) => {
        if (await auth.getSession()) throw redirect({ href: safeRedirect(search.redirect) })
    },
    component: LoginPage,
})

const HEADLINE = "Seus textos prontos, a um clique de distância."

function LoginPage() {
    const { redirect: redirectPath } = Route.useSearch()
    const [signingIn, setSigningIn] = useState(false)

    const handleSignIn = async () => {
        setSigningIn(true)
        try {
            // Redireciona pro Google; o loading fica ligado até a página sair do app.
            await auth.signInWithGoogle(redirectPath)
        } catch {
            toast.error("Não foi possível entrar com o Google. Tente novamente.")
            setSigningIn(false)
        }
    }

    return (
        <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
            <motion.aside
                variants={staggerContainer(0.12, 0.1)}
                initial="hidden"
                animate="show"
                className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex"
            >
                <motion.div
                    aria-hidden="true"
                    className="absolute -top-32 -right-32 size-96 rounded-full bg-primary-foreground/15 blur-3xl"
                    animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.div
                    aria-hidden="true"
                    className="absolute -bottom-40 -left-24 size-80 rounded-full bg-sky-300/20 blur-3xl"
                    animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />

                <motion.div variants={fadeUp} className="relative">
                    <Brand inverted />
                </motion.div>

                <div className="relative grid grid-cols-[minmax(0,1fr)] gap-10">
                    <motion.div variants={popIn}>
                        <CopyDemo />
                    </motion.div>
                    <div className="max-w-md">
                        <motion.h2 variants={staggerContainer(0.06)} className="font-semibold text-4xl leading-[1.05]">
                            {HEADLINE.split(" ").map((word) => (
                                <motion.span key={word} variants={fadeUp} className="mr-[0.25em] inline-block">
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h2>
                        <motion.p variants={fadeUp} className="mt-4 text-primary-foreground/75">
                            Guarde scripts, respostas e objeções que você usa todo dia no atendimento. Busque, clique e
                            cole.
                        </motion.p>
                    </div>
                </div>

                <motion.p variants={fadeUp} className="relative text-primary-foreground/60 text-xs">
                    Seus cards ficam salvos na sua conta.
                </motion.p>
            </motion.aside>

            <main className="flex flex-col items-center justify-center p-6">
                <motion.div
                    variants={staggerContainer(0.1, 0.25)}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-sm"
                >
                    <motion.div variants={fadeUp} className="mb-10 lg:hidden">
                        <Brand />
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="font-semibold text-3xl">
                        Entrar
                    </motion.h1>
                    <motion.p variants={fadeUp} className="mt-2 text-muted-foreground">
                        Use sua conta Google para acessar seus cards.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={hoverSpring}
                        className="mt-8"
                    >
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full gap-3"
                            onClick={handleSignIn}
                            disabled={signingIn}
                        >
                            {signingIn ? <Loader2Icon className="animate-spin" /> : <GoogleIcon />}
                            {signingIn ? "Entrando…" : "Continuar com Google"}
                        </Button>
                    </motion.div>

                    <motion.p variants={fadeUp} className="mt-6 text-center text-muted-foreground text-xs">
                        Ao entrar, só usamos seu nome e e-mail para identificar a sua conta.
                    </motion.p>
                </motion.div>
            </main>
        </div>
    )
}
