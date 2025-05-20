import { Column, Container, Row, Section, Text } from "@react-email/components";
import TemplateEmail from "./template";
import type { TranslationsFunc } from "@/lib/types";
import { name as girlName } from "@/config/girl";

type EmailProps = {
    t: TranslationsFunc;
    amount: number;
    name: string;
    girlName: string;
};

const Tips: React.FC<EmailProps> = async ({ t, amount, name }) => {
    return (
        <TemplateEmail t={t} title={t("emails.tips.title", { girlName })}>
            <Section>
                <Container>
                    <Column>
                        <Row>
                            <Text className="text-xl font-bold">
                                {t("emails.tips.hello", { name })}
                            </Text>
                            <Text>{t("emails.tips.body", { girlName })}</Text>
                        </Row>
                        <Row>
                            <Text className="rounded-xl bg-secondary w-full px-6 py-4 text-center text-3xl font-bold text-white">
                                {amount}
                            </Text>
                        </Row>
                        <Row>
                            <Text>{t("emails.tips.best")}</Text>
                        </Row>
                    </Column>
                </Container>
            </Section>
        </TemplateEmail>
    );
};

export default Tips;
