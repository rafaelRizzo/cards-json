"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useCardsStore } from "@/store/useCardsStore";
import { Download } from "lucide-react";

export default function Import() {
    // Evita objeto no seletor (fonte do loop/infinite re-renders)
    const setCards = useCardsStore((state) => state.setCards);
    const cards = useCardsStore((state) => state.cards);

    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImportCards = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/json") {
            toast.warning("Selecione um arquivo .json válido.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Erro: O arquivo é muito grande (máximo 5MB).");
            event.target.value = "";
            return;
        }

        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const text = loadEvent.target.result;
                const importedCards = JSON.parse(text);

                if (!Array.isArray(importedCards)) {
                    toast.warning("Arquivo inválido: deve ser uma lista de cards.");
                    return;
                }

                setCards(importedCards);
                toast.success(`Importados ${importedCards.length} cards com sucesso!`);
            } catch (err) {
                toast.error("Erro ao importar: verifique se o arquivo é um JSON válido.");
            } finally {
                setIsLoading(false);
                event.target.value = ""; // permite reimportar o mesmo arquivo
            }
        };

        reader.onerror = () => {
            toast.error("Falha ao ler o arquivo.");
            setIsLoading(false);
            event.target.value = "";
        };

        reader.readAsText(file);
    };

    // (Opcional) Exportar — mantive aqui se quiser reaproveitar
    const handleExportCards = () => {
        if (!cards?.length) {
            toast.warning("Nenhum card para exportar.");
            return;
        }
        const timestamp = new Date().toISOString().slice(0, 10);
        const dataStr = JSON.stringify(cards, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cards_${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Cards exportados com sucesso!");
    };

    return (
        <>
            <DropdownMenuItem
                className="flex items-center gap-2 w-full cursor-pointer"
                // use onSelect p/ evitar fechamento do menu
                onSelect={(e) => {
                    e.preventDefault();
                    if (!isLoading) fileInputRef.current?.click();
                }}
                // Radix não usa "disabled" aqui; só bloqueamos via estado/estilo
                aria-label="Importar arquivo JSON de cards"
            >
                {/* Não tem sentido esse icone ser chamado download, claramente a seta exportando e não importando mas ok... */}
                <Download className="w-4 h-4" />
                {isLoading ? "Importando..." : "Importar Cards"}
            </DropdownMenuItem>

            <Input
                type="file"
                accept="application/json"
                onChange={handleImportCards}
                ref={fileInputRef}
                className="hidden"
                aria-hidden="true"
            />
        </>
    );
}
