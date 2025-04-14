import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

/** @type {import("next").NextConfig} */
const nextConfig = withNextIntl({
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "d1uq5d0ebwyvwd.cloudfront.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
});

export default nextConfig;
