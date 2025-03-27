import { Column, Container, Row, Section, Text } from "@react-email/components";
import TemplateEmail from "./template";

type VerifyEmailProps = {
    code: string;
};

const VerifyEmail: React.FC<VerifyEmailProps> = ({ code }) => (
    <TemplateEmail title="Verify your e-mail">
        <Section>
            <Container>
                <Column>
                    <Row>
                        <Text className="text-xl font-bold">Hello!</Text>
                    </Row>
                    <Row>
                        <Text>
                            Please verify your e-mail by copying and pasting the
                            code below in your browser.
                        </Text>
                    </Row>
                    <Row>
                        <Text className="rounded-box border-2 border-primary bg-secondary/30 px-6 py-4 text-center text-3xl font-bold text-primary">
                            {code}
                        </Text>
                    </Row>
                </Column>
            </Container>
        </Section>
    </TemplateEmail>
);

export default VerifyEmail;
