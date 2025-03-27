import { Column, Container, Row, Section, Text } from "@react-email/components";
import TemplateEmail from "./template";

const Login: React.FC = () => (
    <TemplateEmail title="Someone just logged into your account">
        <Section>
            <Container>
                <Column>
                    <Row>
                        <Text className="text-xl font-bold">Hello!</Text>
                    </Row>
                    <Row>
                        <Text>Someone just logged into your account</Text>
                    </Row>
                    <Row>
                        <Text></Text>
                    </Row>
                </Column>
            </Container>
        </Section>
    </TemplateEmail>
);

export default Login;
