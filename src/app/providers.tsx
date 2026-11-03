"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <ThemeProvider
            enableSystem={false}
            attribute="data-theme"
            defaultTheme="light"
            enableColorScheme
        >
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    className:
                        "!bg-canvas !text-ink !border !border-hairline !rounded-md !shadow-[0_8px_24px_rgb(24_29_38/0.10)] !text-sm !px-4 !py-3",
                }}
            />
            {children}
        </ThemeProvider>
    );
};

export default Providers;
