"use client";

import Title from "@/components/ui/title";
import { cn } from "@/lib/utils";
import LogoText from "./logo-text";

type FormProps = {
    title?: string;
    description?: string;
    className?: string;
    logo?: boolean;
    children: React.ReactNode;
};

const Form: React.FC<FormProps> = ({
    title,
    description,
    className,
    children,
    logo = true,
}) => {
    return (
        <div className="form-control size-full items-center justify-center">
            <div className={cn("relative w-full max-w-md", className)}>
                <div className="mb-2 flex flex-col items-center gap-y-2">
                    {logo && <LogoText className="w-auto h-8" />}
                    <div className="flex">
                        {title && (
                            <Title
                                text={title}
                                className="text-center text-5xl"
                                underline
                            />
                        )}
                    </div>
                    <p className="p-0.5">{description}</p>
                </div>
                <div className="flex w-full items-center justify-center">
                    <div className="form-control w-full">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Form;
