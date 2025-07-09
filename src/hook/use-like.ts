import { useState, useCallback } from "react";

type UseLikeReturn = {
    liked: string[];
    toggleLike: (mediaId: string) => Promise<boolean>;
    loading: boolean;
};

const useLike = (initialLikedMedias: string[] = []): UseLikeReturn => {
    const [liked, setLiked] = useState<string[]>(initialLikedMedias);
    const [loading, setLoading] = useState<boolean>(false);

    const toggleLike = useCallback(
        async (mediaId: string): Promise<boolean> => {
            setLoading(true);

            try {
                const response = await fetch(`/api/like`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ mediaId }),
                });

                if (!response.ok) {
                    throw new Error("Failed to toggle like");
                }

                const data = await response.json();

                // Update the liked state based on server response
                setLiked((prevLiked) =>
                    data.liked ?
                        [...prevLiked, mediaId]
                    :   prevLiked.filter((id) => id !== mediaId)
                );

                return data.liked;
            } catch (error) {
                console.error("Error toggling like:", error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return { liked, toggleLike, loading };
};

export default useLike;
