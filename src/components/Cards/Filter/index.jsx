"use client";

import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { SearchIcon, EllipsisVertical, ContrastIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Import from "../Import";
import Export from "../Export";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LuGithub } from "react-icons/lu";

export default function FilterCards({ searchTerm, setSearchTerm }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    if (!mounted) return null; // evita bug de hidratação

    return (
        <nav className="border-b dark:bg-zinc-900 p-2">
            <ul className="flex w-full">
                <li className="flex items-center gap-2 w-full md:w-lg md:mx-auto">
                    <div className="relative flex-1">
                        <SearchIcon className="size-4 shrink-0 opacity-50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            className="rounded-full pl-8 w-full md:min-w-sm dark:bg-zinc-950 text-sm"
                            placeholder="Busque pelo título ou conteúdo..."
                            value={searchTerm}
                            autoComplete="off"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault(); // impede fechamento do menu
                                            toggleTheme();
                                        }}
                                    >
                                        <ContrastIcon />
                                        {theme === "light" ? "Tema escuro" : "Tema claro"}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <Import />
                                <Export />
                                <Link href="https://github.com/rafaelRizzo" target="_blank">
                                    <DropdownMenuItem>
                                        <LuGithub />
                                        Github
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </li>
            </ul>
        </nav>
    );
}
