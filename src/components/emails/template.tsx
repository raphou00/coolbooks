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
import type { TranslationsFunc } from "@/lib/types";

type TemplateEmailProps = {
    t: TranslationsFunc;
    title: string;
    children: React.ReactNode;
};

const TemplateEmail: React.FC<TemplateEmailProps> = async ({
    t,
    title,
    children,
}) => {
    return (
        <Tailwind
            config={{
                theme: {
                    extend: {
                        colors: {
                            brand: "#FF00BD",
                        },
                    },
                },
            }}
        >
            <Html>
                <Head />
                <Preview>{title}</Preview>
                <Body className="mx-auto my-0 bg-white">
                    <Container className="mx-auto my-0 max-w-2xl">
                        <Section className="mt-8">
                            <Img
                                src={`${domain}/pinksea.svg`}
                                width="60px"
                                height="60px"
                                alt="Logo"
                            />
                        </Section>

                        <Heading className="mx-0 my-8 p-0 text-3xl font-bold text-gray-700">
                            {title}
                        </Heading>

                        {children}

                        <Section>
                            <Row className="mb-8 w-full px-2">
                                <Column className="w-">
                                    <Img
                                        src={`${domain}/favicon.svg`}
                                        width="60px"
                                        height="60px"
                                        alt="Logo"
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
                                        <Text className="mb-12 text-left text-xs text-gray-500">
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
