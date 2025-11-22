import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/modal";
import toast from "react-hot-toast";

type DeleteBookProps = {
    bookId: string;
    callback: () => void;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeleteBook: React.FC<DeleteBookProps> = ({
    bookId,
    callback,
    open,
    setOpen,
}) => {
    const t = useTranslations("pages.delete-book");

    const handleDelete = async () => {
        const res = await fetch(`/api/book?bookId=${bookId}`, {
            method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
            toast.success(data.message);
            callback();
        } else {
            toast.error(data.message);
        }

        setOpen(false);
    };

    return (
        <>
            <Modal
                isOpen={open}
                setIsOpen={setOpen}
                className="z-100 w-full max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                        <AlertTriangle
                            aria-hidden="true"
                            className="size-6 text-red-600"
                        />
                    </div>

                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h1 className="text-base font-semibold text-gray-900">
                            {t("delete-book")}
                        </h1>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {t("delete-book-text")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 space-y-2">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-error text-white max-sm:w-full"
                    >
                        {t("delete")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="btn btn-outline max-sm:w-full"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default DeleteBook;
