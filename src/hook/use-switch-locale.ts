import { usePathname, useRouter } from "@/lib/navigation";

const useSwitchLocale = () => {
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (locale: string) => {
        router.push(pathname, { locale });
        router.refresh();
    };

    return switchLocale;
};

export default useSwitchLocale;
