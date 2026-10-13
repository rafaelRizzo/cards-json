// Cabeçalho do dashboard: marca, alternar tema e menu da conta (importar, exportar, sair).
import { Link, useNavigate } from "@tanstack/react-router"
import { DownloadIcon, HistoryIcon, Link2Icon, LogOutIcon, UploadIcon } from "lucide-react"
import { motion } from "motion/react"
import { useRef } from "react"
import { toast } from "sonner"
import { Brand } from "@/components/brand"
import { LegacyImportDialog } from "@/components/Dashboard/legacy-import-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isShareExpired, useCardShares } from "@/hooks/use-card-shares"
import { useCards } from "@/hooks/use-cards"
import { useLegacyImport } from "@/hooks/use-legacy-import"
import { useSession } from "@/hooks/use-session"
import { auth } from "@/lib/auth"
import { describeSkipped, exportCardsToFile, readCardsFromFile } from "@/lib/cards-file"
import { softSpring } from "@/lib/motion"

// Ignora pedaços sem letra (ex.: o "-" de "Rafael -"), senão as iniciais saem "R-".
const initials = (name: string) =>
    name
        .split(" ")
        .filter((part) => /\p{L}/u.test(part))
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()

export function AppHeader() {
    const navigate = useNavigate()
    const session = useSession()
    const { importCards, exportCards } = useCards()
    const legacy = useLegacyImport()
    const { shares } = useCardShares()
    const activeLinks = shares.filter((share) => !isShareExpired(share)).length
    const fileInputRef = useRef<HTMLInputElement>(null)
    const user = session?.user

    const handleExport = async () => {
        // Busca todos em lotes (a lista da tela é paginada); o arquivo não leva id, então vale em qualquer conta.
        const all = await exportCards()
        if (!all) return
        if (all.length === 0) {
            toast.warning("Nenhum card para exportar.")
            return
        }
        exportCardsToFile(all)
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = "" // permite reimportar o mesmo arquivo
        if (!file) return

        try {
            const result = await importCards(await readCardsFromFile(file))
            if (result && result.skipped > 0) toast.warning(describeSkipped(result))
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível ler o arquivo.")
        }
    }

    const handleSignOut = async () => {
        try {
            await auth.signOut()
            await navigate({ to: "/login" })
        } catch {
            toast.error("Não foi possível sair. Tente novamente.")
        }
    }

    return (
        <motion.header
            initial={{ y: -56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={softSpring}
            className="border-b bg-card/60 backdrop-blur"
        >
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
                <Link to="/" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    <Brand size="sm" />
                </Link>

                <div className="flex items-center gap-1">
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    aria-label="Menu da conta"
                                />
                            }
                        >
                            <Avatar>
                                {/* no-referrer: o Google recusa (403/429) a foto quando vem com o endereço do site como referência */}
                                {user?.avatarUrl && (
                                    <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
                                )}
                                <AvatarFallback className="font-medium text-xs">
                                    {initials(user?.name ?? "")}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-normal">
                                    <p className="truncate font-medium text-foreground text-sm">{user?.name}</p>
                                    <p className="truncate text-muted-foreground text-xs">{user?.email}</p>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate({ to: "/links" })}>
                                <Link2Icon />
                                Links compartilhados
                                {activeLinks > 0 && (
                                    <span className="ml-auto text-muted-foreground text-xs tabular-nums">
                                        {activeLinks}
                                    </span>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {legacy.pending && (
                                <DropdownMenuItem onClick={legacy.openDialog}>
                                    <HistoryIcon />
                                    Importar cards antigos
                                    <span className="ml-auto text-muted-foreground text-xs tabular-nums">
                                        {legacy.count}
                                    </span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                <DownloadIcon />
                                Importar cards
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExport}>
                                <UploadIcon />
                                Exportar cards
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOutIcon />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <LegacyImportDialog
                    open={legacy.open}
                    count={legacy.count}
                    onClose={legacy.close}
                    onImport={legacy.importLegacy}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImport}
                />
            </div>
        </motion.header>
    )
}
