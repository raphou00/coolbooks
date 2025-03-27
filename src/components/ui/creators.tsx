"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { type Creator } from "@prisma/client";
import { formatAmountForDisplay } from "@/lib/utils";
import { Link, useRouter } from "@/lib/navigation";
import useWindowSize from "@/hook/use-window-size";
import { useCurrency } from "@/hook/use-currency";
import Image from "./image";
import Modal from "./modal";
import Title from "./title";

type ModelsProps = {
    creators: Creator[];
};

const MAX_WIDTH = 768;

const Models: React.FC<ModelsProps> = ({ creators }) => {
    const t = useTranslations("pages.creators");
    const [creator, setModel] = useState<Creator | undefined>(creators[0]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const windowSize = useWindowSize();
    const { currency, convert } = useCurrency();

    const openModal = (id: string) => {
        if (windowSize.width < MAX_WIDTH) {
            router.push(`/creator/${id}`);
            return;
        }
        const creator = creators.find((creator) => creator.id === id);
        setModel(creator);
        setModalOpen(true);
    };

    useEffect(() => {
        if (windowSize.width < MAX_WIDTH) {
            setModalOpen(false);
        }
    }, [windowSize]);

    return (
        <>
            <div className="mx-auto">
                <div className="grid gap-x-6 gap-y-6 grid-cols-2 md:grid-cols-4">
                    {creators.map((creator) => (
                        <button
                            key={creator.id}
                            onClick={() => openModal(creator.id)}
                            className="group"
                        >
                            <div className="relative overflow-hidden rounded-xl">
                                <Image
                                    alt={creator.name}
                                    src={creator.avatar}
                                    className="w-full aspect-[7/8] rounded-xl object-cover group-hover:scale-105"
                                    width={256}
                                    height={256}
                                />
                            </div>
                            <p className="pt-0.5 text-base md:text-lg text-center">
                                {creator.name}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                className="w-full h-full max-h-[80vh] max-md:hidden"
            >
                <div className="flex flex-col items-start gap-y-6">
                    <div className="size-40 w-full flex gap-x-4">
                        <Image
                            src={creator!.avatar}
                            alt={creator!.name}
                            width={256}
                            height={256}
                            className="size-40 rounded-xl  object-cover user-select-none pointer-events-none"
                        />
                        <div className="flex flex-col justify-between">
                            <div>
                                <p className="text-sm">{creator?.origin}</p>
                                <p className="pt-0.5 text-2xl">
                                    {creator?.name}
                                    <span className="text-neutral">
                                        {" "}
                                        -{" "}
                                        {formatAmountForDisplay(
                                            convert(creator!.price),
                                            currency
                                        )}
                                    </span>
                                </p>
                                <p className="pt-0.5 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[400px]">
                                    {creator?.description}
                                </p>
                            </div>
                            <Link
                                href={`/creator/${creator?.id}`}
                                className="btn btn-sm btn-secondary mt-4 w-fit"
                            >
                                {t("profile")}
                            </Link>
                        </div>
                    </div>
                    <div className="h-40">
                        <div className="flex items-center gap-x-4">
                            <Title
                                text={t("gallery")}
                                className="w-min mb-2"
                                underline
                            />
                            <p>{t("check", { name: creator?.name })}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-[42vh] overflow-y-scroll rounded-lg">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <Image
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg"
                                        alt=""
                                        width={256}
                                        height={256}
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg"
                                        alt=""
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg"
                                        alt=""
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg"
                                        alt=""
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg"
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <Image
                                        width={256}
                                        height={256}
                                        className="h-auto max-w-full rounded-lg"
                                        src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Models;
