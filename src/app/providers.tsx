"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";

const RootProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <ThemeProvider
            enableSystem={false}
            attribute="data-theme"
            enableColorScheme
        >
            <ToasterEl />
            {children}
        </ThemeProvider>
    );
};

const ToasterEl: React.FC = () => {
    const { theme } = useTheme();
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    padding: "10px",
                    border: "1px solid #555555",
                    borderRadius: "100px",
                    backgroundColor: theme == "dark" ? "#111" : "white",
                    color: theme == "dark" ? "white" : "#111",
                },
            }}
        />
    );
};

export default RootProviders;
