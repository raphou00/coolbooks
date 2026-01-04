import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import useSwitchLocale from "@/hook/use-switch-locale";
import { routing, localesTitle } from "@/lib/navigation";
import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";

type LocaleModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LocaleModal: React.FC<LocaleModalProps> = ({ open, setOpen }) => {
    const t = useTranslations("links");
    const switchLocale = useSwitchLocale();
    const locale = useLocale();

    return (
        <Modal isOpen={open} setIsOpen={setOpen} className="max-w-lg w-full">
            <div className="flex flex-col items-center justify-center mx-auto gap-y-6 w-full max-w-md">
                <Title
                    text={t("language")}
                    className="text-5xl mb-6 text-center"
                />

                <div className="space-y-3">
                    {routing.locales.map((l) => (
                        <div key={l} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="locale"
                                className="radio radio-lg radio-secondary border-none checked:bg-secondary/30 mr-2"
                                defaultChecked={locale === l}
                                onChange={() => switchLocale(l)}
                            />
                            <Image
                                src={`/images/locales/${l}.png`}
                                alt={l}
                                width={32}
                                height={32}
                                className="size-6"
                            />
                            {localesTitle[l as keyof typeof localesTitle]}
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default LocaleModal;
