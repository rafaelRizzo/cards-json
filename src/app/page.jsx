"use client"
import { useState } from "react";
import CreateCard from "@/components/Cards/Create";
import ListCards from "@/components/Cards/List";
import FilterCards from "@/components/Cards/Filter";
import { useCardsStore } from "@/store/useCardsStore";
import EditCard from "@/components/Cards/Edit";

export default function Home() {
    const [searchTerm, setSearchTerm] = useState("");
    const jsonCards = useCardsStore((state) => state.cards);
    const addCard = useCardsStore((state) => state.addCard);
    const removeCard = useCardsStore((state) => state.removeCard);

    const filteredCards = jsonCards.filter((card) =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-svh relative">
            <FilterCards searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="max-w-5xl m-auto grid grid-cols-1 gap-4 p-5">
                <CreateCard addCard={addCard} />
                <ListCards filteredCards={filteredCards} onDelete={removeCard} />
            </div>
        </div>
    );
}