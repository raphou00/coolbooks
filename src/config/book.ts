export const selectBook = {
    id: true,
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
            number: true,
            id: true,
            text: true,
            color: true,
            image: true,
        },
    },
};
