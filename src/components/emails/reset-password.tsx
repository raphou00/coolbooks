import {
    Column,
    Container,
    Link,
    Row,
    Section,
    Text,
} from "@react-email/components";
import TemplateEmail from "./template";
import type { TranslationsFunc } from "@/lib/types";
import env from "@/lib/env";

type ResetPasswordEmailProps = {
    t: TranslationsFunc;
    code: string;
    name: string;
};

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = async ({
    t,
    code,
    name,
}) => {
    const link = new URL(`/reset-password?code=${code}`, env.APP_URL!);
    return (
        <TemplateEmail t={t} title={t("emails.reset-password.title")}>
            <Section>
                <Container>
                    <Column>
                        <Row>
                            <Text className="text-xl font-bold">
                                {t("emails.reset-password.hello", { name })}
                            </Text>
                            <Text>{t("emails.reset-password.body")}</Text>
                        </Row>
                        <Row>
                            <Text className="rounded-xl bg-secondary w-full px-6 py-4 text-center text-3xl font-bold text-white">
                                {code}
                            </Text>
                        </Row>
                        <Row>
                            <Text className="text-center text-sm text-gray-400">
                                {t("emails.reset-password.warning")}
                            </Text>
                        </Row>
                        <Row>
                            <Text>{t("emails.reset-password.link")}</Text>
                        </Row>
                        <Row>
                            <Link href={link.href}>{link.toString()}</Link>
                        </Row>
                    </Column>
                </Container>
            </Section>
        </TemplateEmail>
    );
};

export default ResetPasswordEmail;
