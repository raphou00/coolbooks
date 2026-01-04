import type { MetadataRoute } from "next";
import { domain } from "@/config/seo";

const sitemap = (): MetadataRoute.Sitemap => {
    return [
        {
            url: domain,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 1,
        },
    ];
};

export default sitemap;
