import type { MetadataRoute } from "next";
import { domain } from "@/config/seo";
 
const robots = (): MetadataRoute.Robots => {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: "/admin/",
            },
        ],
        sitemap: `${domain}/sitemap.xml`,
    }
}

export default robots;