import daisyui from "daisyui";
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    daisyui: {
        themes: [
            {
                light: {
                    primary: "#330099",
                    "primary-content": "#000000",
                    secondary: "#FF00BD",
                    "secondary-content": "#FFFFFF",
                    neutral: "#555555",
                    "neutral-content": "#2B2B2C",
                    "base-100": "#FFFFFF",
                    "base-200": "#FFFDFF",
                    "base-300": "#F0F0F0",
                    "base-content": "#111111",
                    info: "#B22222",
                    success: "#008000",
                    warning: "#FFD700",
                    error: "#DC143C",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "1rem",
                    "--rounded-badge": "1rem",
                    "--tab-radius": "1rem",
                    "--animation-btn": "0",
                    "--animation-input": "0",
                    "--btn-focus-scale": "0.99",
                },
                dark: {
                    primary: "#330099",
                    "primary-content": "#000000",
                    secondary: "#FF00BD",
                    "secondary-content": "#FFFFFF",
                    neutral: "#AAAAAA",
                    "neutral-content": "#2B2B2C",
                    "base-100": "#111111",
                    "base-200": "#1A1A1A",
                    "base-300": "#222222",
                    "base-content": "#FFFFFF",
                    info: "#B22222",
                    success: "#008000",
                    warning: "#FFD700",
                    error: "#DC143C",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "1rem",
                    "--rounded-badge": "1rem",
                    "--tab-radius": "1rem",
                    "--animation-btn": "0",
                    "--animation-input": "0",
                    "--btn-focus-scale": "0.99",
                },
            },
        ],
    },
    plugins: [daisyui],
};

export default config;
