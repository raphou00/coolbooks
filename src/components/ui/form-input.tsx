"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FormInputProps = {
    type: "text" | "email" | "search" | "number" | "password";
    name: string;
    label: string;
    placeholder: string;
    className?: string;
    id?: string;
    error?: string | null;
    defaultValue?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

const FormInput: React.FC<FormInputProps> = forwardRef<
    HTMLInputElement,
    FormInputProps
>(
    (
        {
            id,
            name,
            placeholder,
            label,
            type,
            className,
            error,
            defaultValue,
            value,
            onChange,
            onKeyDown,
        },
        ref
    ) => {
        const [passwordVisible, setPasswordVisible] = useState(false);

        return (
            <div className="w-full">
                <label className="w-full text-sm">
                    {label && (
                        <div className="w-full flex justify-between pb-1">
                            <span className="label-text px-1 font-bold">
                                {label}
                            </span>
                            <span className="label-text-alt text-error">
                                {error}
                            </span>
                        </div>
                    )}
                    <div className="relative w-full">
                        <input
                            ref={ref}
                            id={id}
                            name={name}
                            type={passwordVisible ? "text" : type}
                            placeholder={placeholder}
                            defaultValue={defaultValue}
                            value={value}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            className={cn(
                                "input w-full px-3 border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-primary/80 focus:outline-none focus:bg-base-300",
                                className
                            )}
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                        {type === "password" && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 mx-1.5 -translate-y-1/2 z-50 cursor-pointer"
                                onClick={() =>
                                    setPasswordVisible((prev) => !prev)
                                }
                            >
                                {passwordVisible ?
                                    <EyeOff />
                                :   <Eye />}
                            </button>
                        )}
                    </div>
                </label>
            </div>
        );
    }
);

FormInput.displayName = "FormInput";

export default FormInput;
