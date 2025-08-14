"use client";
import { toast } from "sonner";
import { useCardsStore } from "@/store/useCardsStore";
import { useRef, useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UploadIcon } from "lucide-react";

export default function Export() {
    const jsonCards = useCardsStore((state) => state.cards);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null); // Referência para o input de arquivo

    // Função para exportar cards com nome de arquivo dinâmico
    const handleExportCards = () => {
        const timestamp = new Date().toISOString().slice(0, 10); // Ex.: 2025-08-12
        const dataStr = JSON.stringify(jsonCards, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cards_${timestamp}.json`; // Nome do arquivo com data
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Cards exportados com sucesso!");
    };

    return (
        <DropdownMenuItem>
            <div
                variant={"outline"}
                onClick={() => handleExportCards()}
                disabled={isLoading}
                className="flex items-center w-full gap-2"
                aria-label="Importar arquivo JSON de cards"
            >
                {/* Não tem sentido esse icone ser chamado upload, claramente a seta está importando e não exportando mas ok... */}
                <UploadIcon className="w-4 h-4" />
                {isLoading ? "Exportando..." : "Exportar Cards"}
            </div>
        </DropdownMenuItem>
    )
}