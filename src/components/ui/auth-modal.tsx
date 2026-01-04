"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BookSchema } from "@/schema/book";
import { ActionsState } from "@/lib/types";
import { cn, requestAPI } from "@/lib/utils";
import { LoginSchema } from "@/schema/login";
import { RegisterSchema } from "@/schema/register";
import Modal from "./modal";
import Title from "./title";
import Form from "./form";
import FormInput from "./form-input";
import FormButton from "./form-button";
import FormReponse from "./form-response";

type AuthFormProps = {
    bookData: BookSchema | null;
    authCallback: (book: BookSchema) => Promise<void>;
};

type AuthModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & AuthFormProps;

const AuthModal: React.FC<AuthModalProps> = ({
    open,
    setOpen,
    bookData,
    authCallback,
}) => {
    const t = useTranslations("pages.auth");
    const [mode, setMode] = useState<"login" | "register">("register");

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            className="h-[calc(100vh-9rem)] w-full max-w-6xl z-50 border border-neutral/20 p-0 overflow-hidden"
        >
            <div className="h-full flex">
                <div
                    style={{
                        backgroundImage: `url('/images/group-of-kids-in-front-of-a-house-reading-books.jpg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="w-1/2 max-[1000px]:hidden relative border-r border-neutral/20"
                />
                <div className="w-1/2 max-[1000px]:w-full h-full overflow-y-scroll p-6">
                    <Title
                        text={t("must-login")}
                        className="text-2xl mb-2 w-fit mx-auto"
                    />
                    <p className="text-center max-w-sm mx-auto mb-6">
                        {t("must-login-text")}
                    </p>
                    <div role="tablist" className="tabs tabs-box w-fit mx-auto">
                        <button
                            className={cn(
                                "tab",
                                mode === "login" && "tab-active"
                            )}
                            onClick={() => setMode("login")}
                        >
                            {t("login")}
                        </button>
                        <button
                            className={cn(
                                "tab",
                                mode === "register" && "tab-active"
                            )}
                            onClick={() => setMode("register")}
                        >
                            {t("register")}
                        </button>
                    </div>
                    {mode === "login" ?
                        <Login
                            bookData={bookData}
                            authCallback={authCallback}
                        />
                    :   <Register
                            bookData={bookData}
                            authCallback={authCallback}
                        />
                    }
                </div>
            </div>
        </Modal>
    );
};

const Login: React.FC<AuthFormProps> = ({ bookData, authCallback }) => {
    const t = useTranslations("pages.login");
    const [state, setState] = useState<ActionsState<LoginSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<LoginSchema>();

    const submit = async (data: LoginSchema) => {
        const res = await requestAPI<LoginSchema>(
            "POST",
            "/api/auth/login",
            data
        );
        setState(res);

        if (!res.success) return;
        else toast.success(res.message!);

        if (bookData) {
            await authCallback(bookData);
        }
    };

    const google = async () => {
        await requestAPI("GET", "/api/auth/google");
    };

    return (
        <Form title={""} className="w-full">
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full max-w-md space-y-2"
            >
                <div className="flex flex-col justify-between gap-2 pt-2">
                    <button
                        type="button"
                        onClick={google}
                        className="btn btn-lg w-full"
                    >
                        <Image
                            src="/images/icons/google.png"
                            alt="Google"
                            className="size-6"
                            width={100}
                            height={100}
                        />
                        Google
                    </button>
                </div>

                <div className="divider px-4 uppercase">{t("or")}</div>

                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <FormInput
                    type="password"
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    error={state.errors?.password?.[0]}
                    {...register("password")}
                />

                <FormButton title={t("submit")} loading={loading} />
            </form>
        </Form>
    );
};

const Register: React.FC<AuthFormProps> = ({ bookData, authCallback }) => {
    const t = useTranslations("pages.register");
    const [state, setState] = useState<ActionsState<RegisterSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<RegisterSchema>();

    const submit = async (data: RegisterSchema) => {
        const res = await requestAPI<RegisterSchema>(
            "POST",
            "/api/auth/register",
            data
        );
        setState(res);

        if (!res.success) return;
        else toast.success(res.message!);

        if (bookData) {
            await authCallback(bookData);
        }
    };

    const google = async () => {
        await requestAPI("GET", "/api/auth/google");
    };

    return (
        <Form title={""} className="w-full">
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full max-w-md space-y-2"
            >
                <div className="flex flex-col justify-between gap-2 pt-2">
                    <button
                        type="button"
                        onClick={google}
                        className="btn btn-lg w-full"
                    >
                        <Image
                            src="/images/icons/google.png"
                            alt="Google"
                            className="size-6"
                            width={100}
                            height={100}
                        />
                        Google
                    </button>
                </div>

                <div className="divider px-4 uppercase">{t("or")}</div>

                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("name")}
                    placeholder={t("name-placeholder")}
                    error={state.errors?.name?.[0]}
                    {...register("name")}
                />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <FormInput
                    type="password"
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    error={state.errors?.password?.[0]}
                    {...register("password")}
                />

                <FormButton title={t("submit")} loading={loading} />

                <p className="mt-5 text-center text-xs">
                    {t.rich("legal", {
                        terms: (chunk) => (
                            <Link href="/terms" className="link link-primary">
                                {chunk}
                            </Link>
                        ),
                        privacy: (chunk) => (
                            <Link href="/privacy" className="link link-primary">
                                {chunk}
                            </Link>
                        ),
                    })}
                </p>
            </form>
        </Form>
    );
};

export default AuthModal;
