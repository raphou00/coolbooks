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
import env from "@/lib/env";

type EmailProps = {
    t: T;
    name: string;
};

const Register: React.FC<EmailProps> = async ({ t, name }) => {
    return (
        <TemplateEmail t={t} title={t("emails.register.title")}>
            <Section>
                <Container>
                    <Column>
                        <Row>
                            <Text className="text-xl font-bold">
                                {t("emails.register.hello", { name })}
                            </Text>
                            <Text>{t("emails.register.body")}</Text>
                        </Row>
                        <Row className="w-full">
                            <Link
                                href={env.APP_URL}
                                className="rounded-xl bg-primary w-1/2 px-6 py-4 text-center text-3xl font-bold text-white my-4"
                            >
                                {t("emails.register.get-started")}
                            </Link>
                        </Row>
                        <Row>
                            <Text>{t("emails.register.best")}</Text>
                        </Row>
                    </Column>
                </Container>
            </Section>
        </TemplateEmail>
    );
};

export default Register;
