import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCardsStore = create(
    persist(
        (set) => ({
            cards: [],
            setCards: (cards) => set({ cards }),
            addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
            removeCard: (id) =>
                set((state) => ({
                    cards: state.cards.filter((card) => card.id !== id),
                })),
        }),
        {
            name: "cards-storage", // chave no localStorage
        }
    )
);
