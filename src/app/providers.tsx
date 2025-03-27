"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

const RootProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <ThemeProvider
            enableSystem={false}
            attribute="data-theme"
            enableColorScheme
        >
            <Toaster
                position="top-right"
                toastOptions={{
                    className: "rounded-md p-4 bg-base-200 text-base-content",
                }}
            />
            {children}
        </ThemeProvider>
    );
};

export default RootProviders;
