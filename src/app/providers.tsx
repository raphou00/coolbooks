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
                        "!bg-base-200 !text-base-content border border-neutral/20 !rounded-field shadow-lg !text-lg !px-6 !py-2",
                }}
            />
            {children}
        </ThemeProvider>
    );
};

export default Providers;
