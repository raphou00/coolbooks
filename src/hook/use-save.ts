import { useState, useCallback } from "react";

type UseSaveReturn = {
    saved: string[];
    toggleSave: (bookId: string) => Promise<boolean>;
    loading: boolean;
};

const useSave = (initialSavedbooks: string[] = []): UseSaveReturn => {
    const [saved, setSaved] = useState<string[]>(initialSavedbooks);
    const [loading, setLoading] = useState<boolean>(false);

    const toggleSave = useCallback(async (bookId: string): Promise<boolean> => {
        setLoading(true);

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

            setSaved((prevSaved) =>
                data.Saved ?
                    [...prevSaved, bookId]
                :   prevSaved.filter((id) => id !== bookId)
            );

            return data.saved;
        } catch (error) {
            console.error("Error toggling save:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return { saved, toggleSave, loading };
};

export default useSave;
