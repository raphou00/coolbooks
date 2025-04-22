import { Resend, type CreateEmailOptions } from "resend";
import { render } from "@react-email/components";
import env from "@/lib/env";
import { title } from "@/config/seo";

const resend = new Resend(env.RESEND_API_KEY);

const sendEmail = async (
    to: string,
    subject: string,
    react: React.ReactElement
) => {
    const text = await render(react, { plainText: true });

    const params: CreateEmailOptions = {
        from: title + " <" + env.SENDER_EMAIL + ">",
        to,
        subject,
        react,
        text,
    };

    try {
        const res = await resend.emails.send(params);
        return res;
    } catch (error) {
        console.error("Error", error);
    }
};

export default sendEmail;
