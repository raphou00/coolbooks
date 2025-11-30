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

type InvoiceEmailProps = {
    t: T;
    name: string;
    credits: number;
    invoicePdfUrl: string;
};

const Invoice: React.FC<InvoiceEmailProps> = async ({
    t,
    name,
    credits,
    invoicePdfUrl,
}) => {
    return (
        <TemplateEmail
            t={t}
            title={t("emails.invoice.title")}
            body={t("emails.invoice.body")}
        >
            <Section>
                <Container>
                    <Column>
                        <Row className="my-6">
                            <Text className="text-xl font-bold">
                                {t("emails.invoice.hello", { name })}
                            </Text>
                            <Text>{t("emails.invoice.body", { credits })}</Text>
                        </Row>
                        <Row className="my-6">
                            <Link
                                href={invoicePdfUrl}
                                className="rounded-full bg-[#6bc4d9] w-1/2 px-6 py-4 text-center text-xl font-bold text-white"
                            >
                                {t("emails.invoice.link")}
                            </Link>
                        </Row>
                    </Column>
                </Container>
            </Section>
        </TemplateEmail>
    );
};

export default Invoice;
