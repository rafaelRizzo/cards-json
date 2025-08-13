"use client"
import { useState, useRef } from "react";
import CreateCard from "@/components/Cards/Create";
import ListCards from "@/components/Cards/List";
import FilterCards from "@/components/Cards/Filter";
import { useCardsStore } from "@/store/useCardsStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null); // Referência para o input de arquivo
    const jsonCards = useCardsStore((state) => state.cards);
    const addCard = useCardsStore((state) => state.addCard);
    const removeCard = useCardsStore((state) => state.removeCard);
    const setCards = useCardsStore((state) => state.setCards);

    const filteredCards = jsonCards.filter((card) =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Função para importar cards do arquivo JSON selecionado
    const handleImportCards = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // Limite de 5MB para o arquivo
            toast.error("Erro: O arquivo é muito grande (máximo 5MB).");
            return;
        }

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedCards = JSON.parse(e.target.result);

                if (!Array.isArray(importedCards)) {
                    toast.warning("Arquivo inválido: deve ser uma lista de cards.");
                    setIsLoading(false);
                    return;
                }

                // Substitui os cards existentes após confirmação
                setCards(importedCards);
                toast.success(`Importados ${importedCards.length} cards com sucesso!`);
            } catch (error) {
                toast.error("Erro ao importar: Verifique se o arquivo é um JSON válido.");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Limpa o input
    };

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
        <div className="h-svh relative">
            <FilterCards searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="max-w-5xl m-auto grid grid-cols-1 gap-4 p-5">
                <CreateCard addCard={addCard} />

                <div className="grid grid-cols-2 gap-2">
                    {/* Botão estilizado para importar */}
                    <div>
                        <Button
                            variant={"outline"}
                            onClick={() => fileInputRef.current.click()}
                            disabled={isLoading}
                            className="flex items-center w-full gap-2"
                            aria-label="Importar arquivo JSON de cards"
                        >
                            <Upload className="w-4 h-4" />
                            {isLoading ? "Importando..." : "Importar Cards"}
                        </Button>
                        <Input
                            type="file"
                            accept="application/json"
                            onChange={handleImportCards}
                            ref={fileInputRef}
                            className="hidden"
                            aria-hidden="true"
                        />
                    </div>

                    {/* Botão de exportação com diálogo de confirmação */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant={"outline"} className="flex items-center gap-2" aria-label="Exportar cards como JSON">
                                <Download className="w-4 h-4" />
                                Exportar Cards
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Exportar Cards</DialogTitle>
                                <DialogDescription>
                                    Você está prestes a exportar {jsonCards.length} cards como um arquivo JSON. Deseja continuar?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { }}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleExportCards}>Confirmar Exportação</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <ListCards filteredCards={filteredCards} onDelete={removeCard} />


            </div>
        </div>
    );
}