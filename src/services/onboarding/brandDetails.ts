import api from "../api";

export interface ApiResponse {
    success: boolean
    data: {
        crawlResult: CrawlResult
        brandData: BrandData
    }
    message: string
}

interface CrawlResult {
    status: string
    completed: number
    total: number
    creditsUsed: number
    expiresAt: string
    next: string | null
    data: CrawlData[]
}

interface CrawlData {
    markdown: string
    warning?: string
}

export interface BrandData {
    brandName: string
    url: string
    promptData: PromptDatum[]
    _id: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface PromptDatum {
    categories: Category[]
}

export interface Category {
    name: string
    questions: string[]
}

export default async function setBrandDetails(brandName: string, url: string) {
    const response = await api.post("/onboarding", {
        brandName: brandName,
        url: url
    });

    return response as ApiResponse;
}