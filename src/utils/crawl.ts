import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export default async function crawl(url: string) {
    const crawlResponse = await firecrawl.crawl(url, {
        maxDiscoveryDepth: 1,
        scrapeOptions: {
            formats: ["markdown"],
        },
        limit: 1,
    })
    //console.log(crawlResponse);
    return crawlResponse;
}