import { Container, Link, Row, Section, Text } from "@react-email/components";
import Template from "./template";
import type { T } from "@/lib/types";

type ReceiptEmailProps = {
    t: T;
    name: string;
    title: string;
    pdf: string;
};

const Receipt: React.FC<ReceiptEmailProps> = async ({
    t,
    name,
    title,
    pdf,
}) => {
    return (
        <Template
            t={t}
            title={t("emails.receipt.title")}
            body={t("emails.receipt.body", { title })}
        >
            <Section>
                <Container>
                    <Row className="my-6">
                        <Text className="text-xl font-bold">
                            {t("emails.receipt.hello", { name })}
                        </Text>
                        <Text>{t("emails.receipt.body", { title })}</Text>
                    </Row>
                    <Row className="my-6">
                        <Link
                            href={pdf}
                            className="rounded-full bg-primary w-1/2 px-6 py-4 text-center text-xl font-bold text-white"
                        >
                            {t("emails.receipt.link")}
                        </Link>
                    </Row>
                </Container>
            </Section>
        </Template>
    );
};

export default Receipt;
