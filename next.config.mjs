import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

/** @type {import("next").NextConfig} */
const nextConfig = withNextIntl({
    images: {
        // Local mode serves pictures from localhost, which the optimizer refuses.
        unoptimized: process.env.LOCAL_MODE === "true",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "d1wnfihdlm61e.cloudfront.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
});

export default nextConfig;
