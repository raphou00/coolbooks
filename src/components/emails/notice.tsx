import { Button, Container, Row, Section, Text } from "@react-email/components";
import Template from "./template";
import type { T } from "@/lib/types";

export type NoticeKind =
    | "print-confirm"
    | "print-reminder"
    | "print-printing"
    | "print-shipped"
    | "print-failed"
    | "print-canceled"
    | "review-request"
    | "review-reward";

type NoticeEmailProps = {
    t: T;
    /** Key under `emails.`, holding `title` and `body` (and `button`). */
    kind: NoticeKind;
    values?: Record<string, string | number>;
    href?: string;
    /** Optional highlighted line, e.g. a discount code. */
    highlight?: string;
};

/** Short status email: heading, text, one button (print orders, reviews). */
const NoticeEmail: React.FC<NoticeEmailProps> = async ({
    t,
    kind,
    values = {},
    href,
    highlight,
}) => {
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

                    {highlight && (
                        <Row>
                            <Text className="my-4 rounded-2xl bg-gray-100 py-4 text-center font-mono text-2xl font-bold tracking-widest">
                                {highlight}
                            </Text>
                        </Row>
                    )}

                    {href && (
                        <Row>
                            <Button
                                href={href}
                                className="w-full! rounded-3xl bg-primary px-8 py-4 text-center text-xl font-bold text-white"
                            >
                                {t(
                                    `emails.${kind}.button` as `emails.print-confirm.button`,
                                    values
                                )}
                            </Button>
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

export default NoticeEmail;
