import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function FilterCards({ searchTerm, setSearchTerm }) {
    return (
        <nav className="border-b dark:bg-zinc-900 p-2">
            <ul className="flex w-full">
                <li className="w-full md:w-lg md:mx-auto">
                    <div className="relative">
                        <SearchIcon className="size-4 shrink-0 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            className="rounded-full pl-8 w-full md:min-w-sm dark:bg-zinc-950 text-sm"
                            placeholder="Busque pelo título ou conteúdo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </li>
            </ul>
        </nav>
    )
}