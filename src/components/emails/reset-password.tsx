import {
    Column,
    Container,
    Link,
    Row,
    Section,
    Text,
} from "@react-email/components";
import TemplateEmail from "./template";
import type { T } from "@/lib/types";
import { domain } from "@/config/seo";

type ResetPasswordEmailProps = {
    t: T;
    code: string;
    name: string;
};

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = async ({
    t,
    code,
    name,
}) => {
    const link = new URL(`/reset-password?code=${code}`, domain);
    return (
        <TemplateEmail
            t={t}
            title={t("emails.forgot-password.title")}
            body={t("emails.forgot-password.body")}
        >
            <Section>
                <Container>
                    <Column>
                        <Row>
                            <Text className="text-xl font-bold">
                                {t("emails.forgot-password.hello", { name })}
                            </Text>
                            <Text>{t("emails.forgot-password.body")}</Text>
                        </Row>
                        <Row>
                            <Text className="rounded-xl bg-primary w-full px-6 py-4 text-center text-3xl font-bold text-white">
                                {code}
                            </Text>
                        </Row>
                        <Row>
                            <Text className="text-center text-sm text-gray-400">
                                {t("emails.forgot-password.warning")}
                            </Text>
                        </Row>
                        <Row>
                            <Text>{t("emails.forgot-password.link")}</Text>
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
