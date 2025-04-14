import createNextIntlPlugin from "next-intl/plugin";
import dotenv from "dotenv";

dotenv.config();

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL.replace(/https?:\/\//, "");

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

/** @type {import("next").NextConfig} */
const nextConfig = withNextIntl({
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: CLOUDFRONT_URL,
                port: "",
                pathname: "/**",
            },
        ],
    },
});

export default nextConfig;
