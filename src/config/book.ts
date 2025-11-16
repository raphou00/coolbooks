export const selectBook = {
    id: true,
    user: {
        select: {
            name: true,
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
