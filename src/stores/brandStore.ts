"use client"

import { create } from "zustand"; 
import { immer } from "zustand/middleware/immer";
import { Category } from "@/services/onboarding/brandDetails";

type BrandState = {
    brandName: string;
    website: string;
    brandId: string;
    prompts: Category[];
    setBrandName: (brandName: string) => void;
    setWebsite: (website: string) => void;
    setBrandId: (brandId: string) => void;
    setPrompts: (prompts: Category[]) => void;
    addPrompt: (prompts: Category[]) => void;
    removePrompt: (index: number) => void;
    removeQuestion: (categoryIndex: number, questionIndex: number) => void;
    addQuestion: (categoryIndex: number, question: string) => void;
    addCategory: (categoryName: string) => void;
}

export const useBrandStore = create<BrandState>()(
    immer((set) => ({
        brandName: '',
        website: '',
        brandId: '',
        prompts: [],
        setBrandName: (brandName: string) => set({ brandName }),
        setWebsite: (website: string) => set({ website }),
        setBrandId: (brandId: string) => set({ brandId }),
        setPrompts: (prompts: Category[]) => set({ prompts }),
        addPrompt: (prompts: Category[]) => set((state) => ({ prompts: [...state.prompts, ...prompts] })),
        removePrompt: (index: number) => set((state) => ({ prompts: state.prompts.filter((_, i) => i !== index) })),
        removeQuestion: (categoryIndex: number, questionIndex: number) => set((state) => {
            state.prompts[categoryIndex].questions.splice(questionIndex, 1);
        }),
        addQuestion: (categoryIndex: number, question: string) => set((state) => {
            state.prompts[categoryIndex].questions.push(question);
        }),
        addCategory: (categoryName: string) => set((state) => {
            state.prompts.push({ name: categoryName, questions: [] });
        }),
    }))
);