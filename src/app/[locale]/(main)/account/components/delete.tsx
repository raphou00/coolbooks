"use client";

import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { requestAPI } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import FormButton from "@/components/ui/form-button";

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
            <form onSubmit={toggleOpen} className="w-full flex justify-start">
                <p className="mt-2">{t("confirm")}</p>

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("submit")}
                        className="btn-error! text-white w-min mt-0"
                    />
                </div>
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
                className="z-100 w-full max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                        <AlertTriangle
                            aria-hidden="true"
                            className="size-6 text-error"
                        />
                    </div>

                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h1 className="text-base font-semibold text-gray-900">
                            {t("sure")}
                        </h1>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {t("confirm")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3 space-y-2">
                    <button
                        type="button"
                        onClick={submit}
                        className="btn btn-error text-white max-sm:w-full"
                    >
                        {t("submit")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="btn max-sm:w-full"
                    >
                        {t("cancel")}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default DeleteAccount;
