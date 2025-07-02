import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

/** @type {import("next").NextConfig} */
const nextConfig = withNextIntl({
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "d2es1jw5vkwpwt.cloudfront.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
});

export default nextConfig;
