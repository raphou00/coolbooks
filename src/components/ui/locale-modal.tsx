import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import useSwitchLocale from "@/hook/use-switch-locale";
import { routing, localesTitle } from "@/lib/navigation";
import Modal from "@/components/ui/modal";

type LocaleModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LocaleModal: React.FC<LocaleModalProps> = ({ open, setOpen }) => {
    const t = useTranslations("links");
    const switchLocale = useSwitchLocale();
    const locale = useLocale();

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            className="w-full sm:w-[420px]"
        >
            <h2 className="type-title-lg text-ink pr-10">{t("language")}</h2>

            <ul className="mt-6 flex flex-col gap-2">
                {routing.locales.map((l) => (
                    <li key={l}>
                        <label className="choice items-center gap-3 px-4 py-3">
                            <input
                                type="radio"
                                name="locale"
                                className="sr-only"
                                defaultChecked={locale === l}
                                onChange={() => switchLocale(l)}
                            />
                            <span className="flex size-9 items-center justify-center rounded-full border-2 border-navy bg-sun font-display text-xs font-semibold uppercase text-navy">
                                {l}
                            </span>
                            <span className="type-label flex-1">
                                {localesTitle[l as keyof typeof localesTitle]}
                            </span>
                            {locale === l && <Check className="size-4" />}
                        </label>
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default LocaleModal;
