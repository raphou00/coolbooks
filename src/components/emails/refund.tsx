import { Container, Row, Section, Text } from "@react-email/components";
import Template from "./template";
import type { T } from "@/lib/types";

type RefundEmailProps = {
    t: T;
};

const Refund: React.FC<RefundEmailProps> = async ({ t }) => {
    return (
        <Template
            t={t}
            title={t("emails.refund.title")}
            body={t("emails.refund.body")}
        >
            <Section>
                <Container>
                    <Row className="my-6">
                        <Text className="text-xl font-bold">
                            {t("emails.refund.hello")}
                        </Text>
                        <Text>{t("emails.refund.body")}</Text>
                    </Row>
                    <Row className="my-6">
                        <Text>{t("emails.refund.best")}</Text>
                    </Row>
                </Container>
            </Section>
        </Template>
    );
};

export default Refund;
