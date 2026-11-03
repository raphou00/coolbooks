import { Button, Container, Row, Section, Text } from "@react-email/components";
import Template from "./template";
import type { T } from "@/lib/types";
import { maxRedraws } from "@/config/stripe";

export type BookEmailKind = "receipt" | "gift" | "gift-sent" | "refund";

type BookEmailProps = {
    t: T;
    kind: BookEmailKind;
    title: string;
    /** Download link for the PDF (not used for refunds). */
    pdf?: string;
    /** Private link to the book page, where pages can be redrawn. */
    bookUrl?: string;
    giftFrom?: string;
    giftTo?: string;
    amount?: string;
};

/** Every email about a purchased book: receipt, gift, gift confirmation, refund. */
const BookEmail: React.FC<BookEmailProps> = async ({
    t,
    kind,
    title,
    pdf,
    bookUrl,
    giftFrom,
    giftTo,
    amount,
}) => {
    const values = {
        title,
        from: giftFrom ?? "",
        to: giftTo ?? "",
        amount: amount ?? "",
        max: maxRedraws,
    };
    const heading = t(`emails.${kind}.title`, values);
    const body = t(`emails.${kind}.body`, values);

    return (
        <Template t={t} title={heading} body={body}>
            <Section>
                <Container>
                    <Row>
                        <Text className="m-0 font-bold">
                            {t("emails.receipt.hello")}
                        </Text>
                        <Text className="m-0 mb-4">{body}</Text>
                    </Row>

                    {pdf && (
                        <Row>
                            <Button
                                href={pdf}
                                className="w-full! rounded-3xl bg-primary px-8 py-4 text-center text-xl font-bold text-white"
                            >
                                {t("emails.receipt.link")}
                            </Button>
                        </Row>
                    )}

                    {bookUrl && kind !== "refund" && (
                        <Row>
                            <Text className="mt-6">
                                <a href={bookUrl}>{t("emails.receipt.view")}</a>
                                {kind === "receipt" &&
                                    " · " +
                                        t("emails.receipt.redraw", {
                                            max: maxRedraws,
                                        })}
                            </Text>
                        </Row>
                    )}

                    <Row>
                        <Text className="mt-8">
                            {t("emails.receipt.thanks")}
                        </Text>
                        <Text>{t("emails.receipt.best")}</Text>
                    </Row>
                </Container>
            </Section>
        </Template>
    );
};

export default BookEmail;
