export const selectBook = {
    user: {
        select: {
            id: true,
        },
    },
    public: true,
    title: true,
    cover: true,
    pages: {
        select: {
            text: true,
            color: true,
            image: true,
        },
    },
};
