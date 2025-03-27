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
import { title as siteTitle } from "@/config/seo";
import env from "@/lib/env";

type TemplateEmailProps = {
    title: string;
    children: React.ReactNode;
};

const TemplateEmail: React.FC<TemplateEmailProps> = ({ title, children }) => (
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
                            src={`${env.APP_URL}/favicon.svg`}
                            width="48"
                            height="48"
                            alt="Logo"
                        />
                    </Section>

                    <Heading className="mx-0 my-8 p-0 text-3xl font-bold text-gray-700">
                        {title}
                    </Heading>

                    {children}

                    <Section>
                        <Row className="mb-8 w-full px-2">
                            <Column className="w-1/3">
                                <Img
                                    src={`${env.APP_URL}/favicon.svg`}
                                    width="48"
                                    height="48"
                                    alt="Logo"
                                />
                            </Column>
                            <Column>
                                <Row>
                                    <Link
                                        className="text-underline text-gray-500"
                                        href={env.APP_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {siteTitle}
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                    <Link
                                        className="text-underline text-gray-500"
                                        href={env.APP_URL + "/terms"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Terms
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                    <Link
                                        className="text-underline text-gray-500"
                                        href={env.APP_URL + "/privacy"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Privacy
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                                    <Link
                                        className="text-underline text-gray-500"
                                        href={env.APP_URL + "/contact"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Contact
                                    </Link>
                                    <Text className="mb-12 text-left text-xs text-gray-500">
                                        &copy; {new Date().getFullYear()}{" "}
                                        {siteTitle}. All rights reserved.
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

export default TemplateEmail;
