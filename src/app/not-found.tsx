import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Title from "@/components/ui/title";

const RootNotFound: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-y-4">
            <Image
                src="/images/error.svg"
                width={475}
                height={400}
                alt="404"
                className="h-44 w-auto animate-bounce"
            />
            <Title text={t("not-found")} className="w-max" />
            <Link href="/" className="btn btn-primary">
                {t("back-home")}
            </Link>
        </div>
    );
};

export const dynamic = "force-dynamic";
export default RootNotFound;
