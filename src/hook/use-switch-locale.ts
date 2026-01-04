import { requestAPI } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

const useSwitchLocale = () => {
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = async (locale: string) => {
        router.push("/" + locale + pathname);
        await requestAPI(
            "POST",
            "/api/account/locale",
            JSON.stringify({ locale })
        );
    };

    return switchLocale;
};

export default useSwitchLocale;
