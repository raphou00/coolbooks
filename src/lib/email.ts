import { Resend, type CreateEmailOptions } from "resend";
import { render } from "@react-email/components";
import env from "@/lib/env";
import { isLocal, saveLocalEmail } from "@/lib/local";
import { title } from "@/config/seo";

// Local mode has no Resend key; emails go to the local inbox instead.
const resend = new Resend(env.RESEND_API_KEY || "re_local");

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

    if (isLocal) {
        const html = await render(react);
        await saveLocalEmail(to, subject, html, text);
        return;
    }

    try {
        const res = await resend.emails.send(params);
        return res;
    } catch (error) {
        console.error("Error", error);
    }
};

export default sendEmail;
