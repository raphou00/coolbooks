import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from "@react-email/components";
import { domain, title as siteTitle } from "@/config/seo";
import type { T } from "@/lib/types";

type TemplateEmailProps = {
    t: T;
    title: string;
    body: string;
    children: React.ReactNode;
};

const TemplateEmail: React.FC<TemplateEmailProps> = async ({
    t,
    title,
    body,
    children,
}) => {
    return (
        <Tailwind>
            <Html>
                <Head />
                <Preview>{body}</Preview>
                <Body className="mx-auto my-0 bg-stone-50 p-4">
                    <Container className="mx-auto my-0 max-w-2xl">
                        <Section className="mt-8">
                            <Img
                                src={`${domain}/cool-books.png`}
                                width="125"
                                height="65"
                                alt="Cool Books Logo Text"
                            />
                        </Section>

                        <Heading className="mx-0 my-8 p-0 text-3xl font-bold text-gray-700">
                            {title}
                        </Heading>

                        {children}

                        <Section>
                            <Row className="mb-8 w-full px-2">
                                <Column className="h-full flex justify-start gap-x-4">
                                    <Img
                                        src={`${domain}/cool-books.png`}
                                        width="40"
                                        height="40"
                                        alt="Cool Books Logo"
                                    />
                                </Column>
                                <Column>
                                    <Row>
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {siteTitle}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/terms"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t("links.terms")}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/privacy"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t("links.privacy")}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/contact"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {t("links.contact")}
                                        </Link>
                                        <Text className="m-0 mt-2 text-left text-xs text-gray-500">
                                            &copy; {new Date().getFullYear()}{" "}
                                            {siteTitle}. {t("common.copyright")}
                                        </Text>
                                    </Row>
                                </Column>
                            </Row>
                        </Section>
                    </Container>
                </Body>
            </Html>
        </Tailwind>
    );
};

export default TemplateEmail;
