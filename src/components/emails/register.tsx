import { Button, Container, Row, Section, Text } from "@react-email/components";
import Template from "./template";
import type { T } from "@/lib/types";
import { domain } from "@/config/seo";

type EmailProps = {
    t: T;
    name: string;
};

const Register: React.FC<EmailProps> = async ({ t, name }) => {
    return (
        <Template
            t={t}
            title={t("emails.register.title")}
            body={t("emails.register.body")}
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
                            href={domain}
                            className="rounded-3xl bg-primary w-full! px-8 py-4 text-center text-xl font-bold text-white"
                        >
                            {t("emails.register.get-started")}
                        </Button>
                    </Row>
                    <Row>
                        <Text className="mt-8">
                            {t("emails.register.best")}
                        </Text>
                    </Row>
                </Container>
            </Section>
        </Template>
    );
};

export default Register;
