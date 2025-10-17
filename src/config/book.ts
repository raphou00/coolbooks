export const selectBook = {
    title: true,
    cover: true,
    promptText: true,
    promptImage: true,
    pages: {
        select: {
            text: true,
            color: true,
            images: {
                select: {
                    src: true,
                    width: true,
                    height: true,
                },
            },
        },
    },
};
