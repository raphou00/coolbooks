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
    Text,
    Tailwind,
    pixelBasedPreset,
} from "@react-email/components";
import { domain, title as siteTitle } from "@/config/seo";
import type { T } from "@/lib/types";

type TemplateProps = {
    t: T;
    title: string;
    body: string;
    children: React.ReactNode;
};

const Template: React.FC<TemplateProps> = async ({
    t,
    title,
    body,
    children,
}) => {
    return (
        <Tailwind
            config={{
                presets: [pixelBasedPreset],
                theme: {
                    extend: {
                        colors: {
                            primary: "#6bc4d9",
                        },
                    },
                },
            }}
        >
            <Html>
                <Head />
                <Preview>{body}</Preview>
                <Body className="mx-auto my-0 bg-stone-50 p-4">
                    <Container className="mx-auto my-0 max-w-xl">
                        <Section className="mt-4">
                            <Img
                                src={`${domain}/favicon-96x96.png`}
                                width="70"
                                height="70"
                                alt="Coolbooks Logo"
                            />
                        </Section>

                        <Heading className="mx-0 my-4 p-0 text-3xl font-bold text-primary">
                            {title}
                        </Heading>

                        {children}

                        <Section>
                            <Row className="mb-8 w-full px-2">
                                <Column className="space-x-4">
                                    <Img
                                        src={`${domain}/favicon-96x96.png`}
                                        width="40"
                                        height="40"
                                        alt="Coolbooks Logo"
                                    />
                                </Column>
                                <Column>
                                    <Row>
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain}
                                            rel="noopener noreferrer"
                                        >
                                            {siteTitle}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/terms"}
                                            rel="noopener noreferrer"
                                        >
                                            {t("links.terms")}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/privacy"}
                                            rel="noopener noreferrer"
                                        >
                                            {t("links.privacy")}
                                        </Link>
                                        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                        <Link
                                            className="text-underline text-gray-500"
                                            href={domain + "/contact"}
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

export default Template;
