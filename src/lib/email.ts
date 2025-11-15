import { Resend, type CreateEmailOptions } from "resend";
import env from "@/lib/env";
import { title } from "@/config/seo";

const resend = new Resend(env.RESEND_API_KEY);

const sendEmail = async (
    to: string,
    from: string,
    subject: string,
    text: string,
    react: React.ReactElement
) => {
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
