import { useState } from "react";

const useLike = (initialLiked: string[]) => {
    const [liked, setLiked] = useState<string[]>(initialLiked);

    const toggleLike = async (id: string) => {
        try {
            const method = liked.includes(id) ? "DELETE" : "POST";
            if (method == "POST") setLiked((e) => [...e, id]);
            else setLiked((e) => e.filter((a) => a !== id));
            await fetch(`/api/like?mediaId=${id}`, { method });
        } catch {
            setLiked(liked);
        }
    };

    return { liked, toggleLike };
};

export default useLike;
