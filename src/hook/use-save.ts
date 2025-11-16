import { useState, useCallback } from "react";

type UseSaveReturn = (
    action: "save" | "unsave",
    bookId: string
) => Promise<boolean>;

const useSave = (): UseSaveReturn => {
    const toggleSave = useCallback(
        async (action: "save" | "unsave", bookId: string): Promise<boolean> => {
            try {
                const response = await fetch(`/api/book/save`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ bookId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to toggle Save");
                }

                const data = await response.json();

                return data.saved;
            } catch (error) {
                console.error("Error toggling save:", error);
                throw error;
            }
        },
        []
    );

    return toggleSave;
};

export default useSave;
