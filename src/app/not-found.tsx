import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Title from "@/components/ui/title";

const dynamic = "force-dynamic";

const RootNotFound: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center h-screen w-screen flex flex-col items-center justify-center">
            <Image
                src="/images/book-sad.svg"
                width={400}
                height={400}
                alt="404"
                className="mx-auto h-44"
            />
            <Title
                text={t("not-found")}
                className="mx-auto w-max my-2"
                underline
            />
            <Link href="/" className="btn btn-primary">
                {t("back-home")}
            </Link>
        </div>
    );
};

export { dynamic };
export default RootNotFound;
