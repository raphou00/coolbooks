import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/modal";

type FullscreenErrorProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const FullscreenError: React.FC<FullscreenErrorProps> = ({ open, setOpen }) => {
    const t = useTranslations("pages.book.fullscreen-error");

    return (
        <>
            <Modal
                isOpen={open}
                setIsOpen={setOpen}
                className="z-100 w-full max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-50 sm:mx-0 sm:size-10">
                        <AlertTriangle
                            aria-hidden="true"
                            className="size-6 text-warning"
                        />
                    </div>

                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h1 className="text-base font-semibold text-gray-900">
                            {t("title")}
                        </h1>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {t("description")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex btn"
                    >
                        {t("close")}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default FullscreenError;
