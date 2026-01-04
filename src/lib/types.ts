import { getTranslations } from "next-intl/server";
import type { routing } from "./navigation";
import type { Prisma } from "../generated/prisma/client";
import type { Role as RoleEnum } from "../generated/prisma/enums";

export type ActionsState<T> = {
    success: boolean;
    message?: string;
    errors?: { [K in keyof T]?: string[] | undefined };
    redirect?: string;
} & {
    [key: string]: any;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getT = async () => await getTranslations({ locale: "en" });
export type T = Awaited<ReturnType<typeof getT>>;

export type Locale = (typeof routing.locales)[number];

export type User = Prisma.UserModel;
export type Session = Prisma.SessionModel;
export type Token = Prisma.TokenModel;
export type Role = RoleEnum;
