"use client";

import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useState } from "react";
import { requestAPI } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import FormButton from "@/components/ui/form-button";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type DeleteAccountProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeleteAccount: React.FC = () => {
    const t = useTranslations("pages.account-delete");
    const [open, setOpen] = useState<boolean>(false);

    const toggleOpen: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setOpen(true);
    };

    return (
        <>
            <form
                onSubmit={toggleOpen}
                className="flex w-full flex-col items-start gap-4"
            >
                <p className="type-body text-body">{t("confirm")}</p>
                <FormButton
                    title={t("submit")}
                    className="button-danger mt-0 w-full sm:w-auto"
                />
            </form>

            <DeleteModal open={open} setOpen={setOpen} />
        </>
    );
};

const DeleteModal: React.FC<DeleteAccountProps> = ({ open, setOpen }) => {
    const t = useTranslations("pages.account-delete");

    const submit = async () => {
        const res = await requestAPI("DELETE", "/api/account/delete-account");
        if (res.success && res.message) {
            toast.success(res.message);
            window.location.replace("/");
        }
    };

    return (
        <>
            <Modal
                isOpen={open}
                setIsOpen={setOpen}
                className="w-full sm:w-[440px]"
            >
                <ConfirmDialog
                    title={t("sure")}
                    description={t("confirm")}
                    confirmLabel={t("submit")}
                    cancelLabel={t("cancel")}
                    onConfirm={submit}
                    onCancel={() => setOpen(false)}
                />
            </Modal>
        </>
    );
};

export default DeleteAccount;
