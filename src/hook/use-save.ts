import { useCallback } from "react";
import { requestAPI } from "@/lib/utils";

type UseSaveReturn = (
    action: "save" | "unsave",
    bookId: string
) => Promise<boolean>;

const useSave = (): UseSaveReturn => {
    const toggleSave = useCallback(
        async (action: "save" | "unsave", bookId: string): Promise<boolean> => {
            try {
                const data = await requestAPI(
                    "POST",
                    "/api/book/save",
                    JSON.stringify({ action, bookId })
                );

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
