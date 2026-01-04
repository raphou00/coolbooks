"use client";

import Title from "@/components/ui/title";
import { cn } from "@/lib/utils";
import Logo from "./logo";

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
        <div className="w-full flex items-center justify-center">
            <div className={cn("relative w-full max-w-md", className)}>
                <div className="flex flex-col items-center gap-y-2">
                    {logo && <Logo className="w-auto h-16" />}
                    <div className="flex">
                        {title && (
                            <Title
                                text={title}
                                className="text-center text-4xl md:text-5xl lg:text-6xl font-bold w-fit"
                            />
                        )}
                    </div>
                    <p className="p-0.5">{description}</p>
                </div>
                <div className="flex w-full items-center justify-center">
                    <div className="flex flex-col w-full">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Form;
