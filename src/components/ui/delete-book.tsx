import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { requestAPI } from "@/lib/utils";

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
        const data = await requestAPI("DELETE", `/api/book?bookId=${bookId}`);

        if (data.success) {
            toast.success(data.message!);
            callback();
        }

        setOpen(false);
    };

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            className="w-full sm:w-[440px]"
        >
            <ConfirmDialog
                title={t("delete-book")}
                description={t("delete-book-text")}
                confirmLabel={t("delete")}
                cancelLabel={t("cancel")}
                onConfirm={handleDelete}
                onCancel={() => setOpen(false)}
            />
        </Modal>
    );
};

export default DeleteBook;
