"use client"

import { create } from "zustand"; 
import { immer } from "zustand/middleware/immer";

type BrandState = {
    brandName: string;
    website: string;
    prompts: string[];
    setBrandName: (brandName: string) => void;
    setWebsite: (website: string) => void;
    setPrompts: (prompts: string[]) => void;
    addPrompt: (prompt: string) => void;
    removePrompt: (prompt: string) => void;
}

export const useBrandStore = create<BrandState>()(
    immer((set) => ({
        brandName: '',
        website: '',
        prompts: [],
        setBrandName: (brandName: string) => set({ brandName }),
        setWebsite: (website: string) => set({ website }),
        setPrompts: (prompts: string[]) => set({ prompts }),
        addPrompt: (prompt: string) => set((state) => ({ prompts: [...state.prompts, prompt] })),
        removePrompt: (prompt: string) => set((state) => ({ prompts: state.prompts.filter((p: string) => p !== prompt) })),
    }))
);