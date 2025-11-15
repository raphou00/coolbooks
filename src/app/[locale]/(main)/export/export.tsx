"use client";

type BookProps = {
    book: {
        user: {
            name: string;
        };
        id: string;
        title: string;
        cover: string;
        public: boolean;
        artStyle: string;
        themes: string[];
        updatedAt: Date;
        pages: {
            number: number;
            image: string;
            text: string;
            color: string;
        }[];
    };
};

const Export: React.FC<BookProps> = ({ book }) => {
    return <></>;
};

export default Export;
