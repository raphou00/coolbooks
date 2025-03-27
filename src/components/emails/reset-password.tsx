import {
    Column,
    Container,
    Link,
    Row,
    Section,
    Text,
} from "@react-email/components";
import TemplateEmail from "./template";

type ResetPasswordEmailProps = {
    link: string;
};

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ link }) => (
    <TemplateEmail title="Reset your password">
        <Section>
            <Container>
                <Column>
                    <Row>
                        <Text className="text-xl font-bold">Hello!</Text>
                    </Row>
                    <Row>
                        <Text>
                            Please click on the link below to reset your
                            password.
                        </Text>
                    </Row>
                    <Row>
                        <Link
                            href={link}
                            className="rounded-box border-2 border-primary bg-secondary/30 px-6 py-4 text-center text-3xl font-bold text-primary"
                        >
                            Reset
                        </Link>
                    </Row>
                    <Row>
                        <Text className="text-center text-sm text-gray-400">
                            If you did not request a password reset, please
                            ignore this email.
                        </Text>
                    </Row>
                </Column>
            </Container>
        </Section>
    </TemplateEmail>
);

export default ResetPasswordEmail;
