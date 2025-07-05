import { useRouter } from "next/navigation";

const useSwitchLocale = () => {
    const router = useRouter();

    const switchLocale = (locale: string) => {
        router.push("/" + locale);
        router.refresh();
    };

    return switchLocale;
};

export default useSwitchLocale;
