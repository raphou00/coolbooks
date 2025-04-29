import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

/** @type {import("next").NextConfig} */
const nextConfig = withNextIntl({
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "dgwaeywsjz0ms.cloudfront.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
});

export default nextConfig;
