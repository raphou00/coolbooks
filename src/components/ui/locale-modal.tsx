import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import useSwitchLocale from "@/hook/use-switch-locale";
import { locales, localesTitle } from "@/lib/navigation";
import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type LocaleModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LocaleModal: React.FC<LocaleModalProps> = ({ open, setOpen }) => {
    const t = useTranslations("links");
    const switchLocale = useSwitchLocale();
    const locale = useLocale();

    return (
        <Modal isOpen={open} setIsOpen={setOpen} className="z-100 w-full">
            <div className="flex flex-col items-center justify-center mx-auto gap-y-6 w-full max-w-lg p-6">
                <Title
                    text={t("language")}
                    className="text-3xl mb-6 text-center"
                    underline
                />

                <div className="w-full">
                    <p className="mb-1 ml-1">{t("language")}</p>
                    <Select
                        defaultValue={locale}
                        value={locale}
                        onValueChange={(l) => switchLocale(l)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("language")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {locales.map((l) => (
                                    <SelectItem key={l} value={l}>
                                        <div className="flex items-center gap-2">
                                            <Image
                                                src={`/images/locales/${l}.png`}
                                                alt={l}
                                                width={32}
                                                height={32}
                                                className="size-6"
                                            />
                                            {
                                                localesTitle[
                                                    l as keyof typeof localesTitle
                                                ]
                                            }
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Modal>
    );
};

export default LocaleModal;
