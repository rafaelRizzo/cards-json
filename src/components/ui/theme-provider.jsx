"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import NProgress from "nprogress";
import { usePathname } from "next/navigation"; // Para pegar o path da rota

// Não precisa importar CSS se não for usar o estilo padrão

export function ThemeProvider({ children, ...props }) {
    const pathname = usePathname();

    React.useEffect(() => {
        const handleStart = () => {
            NProgress.start();
        };

        const handleStop = () => {
            NProgress.done();
        };

        // Usando pathname para detectar mudanças de rota
        if (pathname) {
            handleStart();
            handleStop();
        }

        return () => {
            NProgress.done(); // Garante que o progresso será finalizado se o componente for desmontado
        };
    }, [pathname]); // Vai disparar toda vez que a rota mudar

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}