import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCardsStore = create(
    persist(
        (set) => ({
            cards: [],
            setCards: (cards) => set({ cards }),
            addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
        }),
        {
            name: "cards-storage", // nome da chave no localStorage
        }
    )
);
