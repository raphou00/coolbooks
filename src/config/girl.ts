export const findGirlsWithMedias = {
    id: true,
    name: true,
    username: true,
    avatar: true,
    cover: true,
    price: true,
    origin: true,
    tags: true,
    likes: true,
    bio: true,
    medias: {
        select: {
            id: true,
            description: true,
            videos: {
                select: {
                    src: true,
                    blurred: true,
                    width: true,
                    height: true,
                    free: true,
                    thumbnail: true,
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
        },
    },
    createdAt: true,
    updatedAt: true,
};
