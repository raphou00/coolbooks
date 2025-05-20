export const name = "Clems 💕";
export const description = "Hellooo 👋";
export const avatar = "/clems.jpg";
export const origin = "France";
export const findAllMedias = {
    id: true,
    description: true,
    tags: true,
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
