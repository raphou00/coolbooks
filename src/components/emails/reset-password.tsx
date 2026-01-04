import {
    Button,
    Container,
    Link,
    Row,
    Section,
    Text,
} from "@react-email/components";
import Template from "./template";
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
        <Template
            t={t}
            title={t("emails.forgot-password.title")}
            body={t("emails.forgot-password.body")}
        >
            <Section>
                <Container>
                    <Row>
                        <Text className="m-0 font-bold">
                            {t("emails.register.hello", {
                                name,
                            })}
                        </Text>
                        <Text className="m-0 mb-4">
                            {t("emails.register.body")}
                        </Text>
                    </Row>
                    <Row>
                        <Button
                            className="rounded-3xl bg-primary w-full! px-8 py-4 text-center text-2xl font-bold text-white"
                            href={link.href}
                        >
                            {t("emails.forgot-password.click")}
                        </Button>
                    </Row>
                    <Row>
                        <Text className="mt-2 mb-4 text-sm text-gray-400">
                            {t("emails.forgot-password.warning")}
                        </Text>
                    </Row>
                    <Row>
                        <Text className="m-0">
                            {t("emails.forgot-password.link")}
                        </Text>
                    </Row>
                    <Row className="my-5">
                        <Link href={link.href}>{link.toString()}</Link>
                    </Row>
                </Container>
            </Section>
        </Template>
    );
};

export default ResetPasswordEmail;
