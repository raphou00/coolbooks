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
            <label className="block w-full">
                {(label || error) && (
                    <span className="flex items-baseline justify-between gap-2">
                        {label && <span className="field-label">{label}</span>}
                        {error && (
                            <span className="type-body text-error pb-1.5">
                                {error}
                            </span>
                        )}
                    </span>
                )}
                <span className="relative block w-full">
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
                        aria-invalid={!!error}
                        className={cn(
                            "field",
                            type === "password" && "pr-12",
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
                            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-muted"
                            onClick={() => setPasswordVisible((prev) => !prev)}
                            aria-label={
                                passwordVisible ? "Hide password" : (
                                    "Show password"
                                )
                            }
                        >
                            {passwordVisible ?
                                <EyeOff className="size-4" />
                            :   <Eye className="size-4" />}
                        </button>
                    )}
                </span>
            </label>
        );
    }
);

FormInput.displayName = "FormInput";

export default FormInput;
