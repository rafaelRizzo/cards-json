// Catálogo de ícones e cores dos cards (rótulos em pt-BR) e a moldura colorida do ícone.

import {
    AlertCircleIcon,
    AlertTriangleIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    CalendarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    DotIcon,
    DownloadIcon,
    EditIcon,
    EyeIcon,
    EyeOffIcon,
    FlameIcon,
    GhostIcon,
    HeartIcon,
    HomeIcon,
    InfoIcon,
    LightbulbIcon,
    LockIcon,
    type LucideIcon,
    MailIcon,
    MapPinIcon,
    MessageCircleIcon,
    MinusIcon,
    MoonIcon,
    PhoneIcon,
    PlusIcon,
    SearchIcon,
    SettingsIcon,
    StarIcon,
    SunIcon,
    Trash2Icon,
    UnlockIcon,
    UploadIcon,
    UserIcon,
    UsersIcon,
} from "lucide-react"
import { type HTMLMotionProps, motion } from "motion/react"
import { cn } from "@/lib/utils"

export const iconMap: Record<string, LucideIcon> = {
    FlameIcon,
    LightbulbIcon,
    HeartIcon,
    GhostIcon,
    DotIcon,
    SunIcon,
    MoonIcon,
    StarIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    AlertCircleIcon,
    InfoIcon,
    SettingsIcon,
    UserIcon,
    UsersIcon,
    SearchIcon,
    UploadIcon,
    DownloadIcon,
    Trash2Icon,
    EditIcon,
    PlusIcon,
    MinusIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    HomeIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    PhoneIcon,
    MailIcon,
    MessageCircleIcon,
    LockIcon,
    UnlockIcon,
    EyeIcon,
    EyeOffIcon,
}

// Classes completas (e não montadas por template) para o Tailwind enxergar todas.
export const iconColorClassMap: Record<string, string> = {
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
}

export const colorClassMap: Record<string, string> = {
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
}

export const colors = Object.keys(colorClassMap)

export const colorLabels: Record<string, string> = {
    red: "Vermelho",
    orange: "Laranja",
    amber: "Âmbar",
    yellow: "Amarelo",
    lime: "Lima",
    green: "Verde",
    emerald: "Esmeralda",
    teal: "Verde-azulado",
    cyan: "Ciano",
    sky: "Céu",
    blue: "Azul",
    indigo: "Índigo",
    violet: "Violeta",
    purple: "Roxo",
    fuchsia: "Fúcsia",
    pink: "Rosa",
    rose: "Rosé",
    gray: "Cinza",
    zinc: "Zinco",
    neutral: "Neutro",
    stone: "Pedra",
}

export const iconLabels: Record<string, string> = {
    FlameIcon: "Fogo",
    LightbulbIcon: "Ideia",
    HeartIcon: "Coração",
    GhostIcon: "Fantasma",
    DotIcon: "Ponto",
    SunIcon: "Sol",
    MoonIcon: "Lua",
    StarIcon: "Estrela",
    CheckCircleIcon: "Confirmado",
    AlertTriangleIcon: "Atenção",
    AlertCircleIcon: "Alerta",
    InfoIcon: "Informação",
    SettingsIcon: "Configurações",
    UserIcon: "Pessoa",
    UsersIcon: "Pessoas",
    SearchIcon: "Busca",
    UploadIcon: "Enviar",
    DownloadIcon: "Baixar",
    Trash2Icon: "Lixeira",
    EditIcon: "Editar",
    PlusIcon: "Mais",
    MinusIcon: "Menos",
    ChevronRightIcon: "Direita",
    ChevronLeftIcon: "Esquerda",
    ArrowUpIcon: "Para cima",
    ArrowDownIcon: "Para baixo",
    HomeIcon: "Casa",
    CalendarIcon: "Calendário",
    ClockIcon: "Relógio",
    MapPinIcon: "Local",
    PhoneIcon: "Telefone",
    MailIcon: "E-mail",
    MessageCircleIcon: "Mensagem",
    LockIcon: "Trancado",
    UnlockIcon: "Destrancado",
    EyeIcon: "Visível",
    EyeOffIcon: "Oculto",
}

// Moldura do ícone: fundo e borda em tom suave da cor escolhida, ícone em tom
// mais forte (e mais claro no tema escuro) para o contraste ficar legível.
// Classes completas para o Tailwind enxergar todas.
const tileClassMap: Record<string, string> = {
    red: "bg-red-500/15 text-red-600 ring-red-500/25 dark:bg-red-400/20 dark:text-red-400 dark:ring-red-400/30",
    orange: "bg-orange-500/15 text-orange-600 ring-orange-500/25 dark:bg-orange-400/20 dark:text-orange-400 dark:ring-orange-400/30",
    amber: "bg-amber-500/15 text-amber-600 ring-amber-500/25 dark:bg-amber-400/20 dark:text-amber-400 dark:ring-amber-400/30",
    yellow: "bg-yellow-500/15 text-yellow-600 ring-yellow-500/25 dark:bg-yellow-400/20 dark:text-yellow-400 dark:ring-yellow-400/30",
    lime: "bg-lime-500/15 text-lime-600 ring-lime-500/25 dark:bg-lime-400/20 dark:text-lime-400 dark:ring-lime-400/30",
    green: "bg-green-500/15 text-green-600 ring-green-500/25 dark:bg-green-400/20 dark:text-green-400 dark:ring-green-400/30",
    emerald:
        "bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:bg-emerald-400/20 dark:text-emerald-400 dark:ring-emerald-400/30",
    teal: "bg-teal-500/15 text-teal-600 ring-teal-500/25 dark:bg-teal-400/20 dark:text-teal-400 dark:ring-teal-400/30",
    cyan: "bg-cyan-500/15 text-cyan-600 ring-cyan-500/25 dark:bg-cyan-400/20 dark:text-cyan-400 dark:ring-cyan-400/30",
    sky: "bg-sky-500/15 text-sky-600 ring-sky-500/25 dark:bg-sky-400/20 dark:text-sky-400 dark:ring-sky-400/30",
    blue: "bg-blue-500/15 text-blue-600 ring-blue-500/25 dark:bg-blue-400/20 dark:text-blue-400 dark:ring-blue-400/30",
    indigo: "bg-indigo-500/15 text-indigo-600 ring-indigo-500/25 dark:bg-indigo-400/20 dark:text-indigo-400 dark:ring-indigo-400/30",
    violet: "bg-violet-500/15 text-violet-600 ring-violet-500/25 dark:bg-violet-400/20 dark:text-violet-400 dark:ring-violet-400/30",
    purple: "bg-purple-500/15 text-purple-600 ring-purple-500/25 dark:bg-purple-400/20 dark:text-purple-400 dark:ring-purple-400/30",
    fuchsia:
        "bg-fuchsia-500/15 text-fuchsia-600 ring-fuchsia-500/25 dark:bg-fuchsia-400/20 dark:text-fuchsia-400 dark:ring-fuchsia-400/30",
    pink: "bg-pink-500/15 text-pink-600 ring-pink-500/25 dark:bg-pink-400/20 dark:text-pink-400 dark:ring-pink-400/30",
    rose: "bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:bg-rose-400/20 dark:text-rose-400 dark:ring-rose-400/30",
    gray: "bg-gray-500/15 text-gray-600 ring-gray-500/25 dark:bg-gray-400/20 dark:text-gray-400 dark:ring-gray-400/30",
    zinc: "bg-zinc-500/15 text-zinc-600 ring-zinc-500/25 dark:bg-zinc-400/20 dark:text-zinc-400 dark:ring-zinc-400/30",
    neutral:
        "bg-neutral-500/15 text-neutral-600 ring-neutral-500/25 dark:bg-neutral-400/20 dark:text-neutral-400 dark:ring-neutral-400/30",
    stone: "bg-stone-500/15 text-stone-600 ring-stone-500/25 dark:bg-stone-400/20 dark:text-stone-400 dark:ring-stone-400/30",
}

type CardIconTileProps = Omit<HTMLMotionProps<"span">, "className"> & {
    icon: string
    color: string
    className?: string
    iconClassName?: string
}

// Classes da moldura de uma cor (fundo suave, borda sutil e ícone em tom mais forte).
export const tileClass = (color: string) => tileClassMap[color] ?? tileClassMap.gray

export function CardIconTile({ icon, color, className, iconClassName, ...props }: CardIconTileProps) {
    const Icon = iconMap[icon] ?? iconMap.DotIcon
    return (
        <motion.span
            className={cn(
                "grid shrink-0 place-items-center ring-1",
                tileClassMap[color] ?? tileClassMap.gray,
                className,
            )}
            {...props}
        >
            <Icon className={iconClassName} />
        </motion.span>
    )
}
