import { ChatAnthropic } from "@langchain/anthropic";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";


const model = new ChatAnthropic({
    model: "claude-3-5-haiku-latest",
    temperature: 0
});

const schema = z.object({
    categories: z.array(z.object({
        name: z.string(),
        questions: z.array(z.string()).length(5),
    })).length(10)
});

const structuredLlm = model.withStructuredOutput(schema);

export default async function getAnalysisQueries(markdownContent: string, url: string) {
    const messages = [
        new SystemMessage("You are an expert research strategist. Your task is to generate 50 diverse queries/questions about a company or product based on the domain and landing page content I provide. The queries should be grouped into 10 categories, each containing 5 unique questions. \n\n Guidelines: \n 1. Ensure categories cover different perspectives such as: \n - Understanding of Product \n - General Questions \n - Competitive Analysis \n - Customer Use Cases \n - Pricing & Plans \n - Technical Details \n - Integrations & Ecosystem \n - Market Reputation & Reviews \n - Future Roadmap & Trends \n - Miscellaneous/Creative Questions \n \n 2. Questions should vary in phrasing and intent so they can elicit broad, useful responses from LLMs.\n\n 3. Use context from the provided domain landing page to make questions relevant and specific. "),

        new HumanMessage(markdownContent),
    ];

    const response = await structuredLlm.invoke(messages);
    //console.log(response);
    return response
}