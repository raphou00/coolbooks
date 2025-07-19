import { usePathname, useRouter } from "next/navigation";

const useSwitchLocale = () => {
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (locale: string) => {
        router.push("/" + locale + pathname);
        router.refresh();
    };

    return switchLocale;
};

export default useSwitchLocale;
