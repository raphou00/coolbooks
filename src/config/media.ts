export const findAllMedias = {
    id: true,
    description: true,
    tags: true,
    createdAt: true,
    videos: {
        select: {
            src: true,
            blurred: true,
            width: true,
            height: true,
            free: true,
            time: true,
        },
    },
    images: {
        select: {
            blurred: true,
            src: true,
            width: true,
            height: true,
            free: true,
        },
    },
};
