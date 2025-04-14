import { HeartCrack } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import Title from "@/components/ui/title";

const dynamic = "force-dynamic";

const RootNotFound: React.FC = () => {
    const t = useTranslations("common");
    return (
        <div className="text-center my-12">
            <HeartCrack className="text-accent mx-auto h-16 w-auto" />
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
