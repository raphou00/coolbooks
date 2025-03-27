"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormInputProps = {
    type: "text" | "email" | "number" | "password";
    name: string;
    label: string;
    placeholder: string;
    error?: string | null;
    defaultValue?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const FormInput: React.FC<FormInputProps> = forwardRef<
    HTMLInputElement,
    FormInputProps
>(
    (
        {
            name,
            placeholder,
            label,
            type,
            error,
            defaultValue,
            value,
            onChange,
        },
        ref
    ) => {
        const [passwordVisible, setPasswordVisible] = useState(false);

        return (
            <div className="w-full">
                <label className="form-control w-full">
                    <div className="label pb-1">
                        <span className="label-text font-bold">{label}</span>
                        <span className="label-text-alt text-error">
                            {error}
                        </span>
                    </div>
                    <div className="relative w-full">
                        <input
                            ref={ref}
                            name={name}
                            type={passwordVisible ? "text" : type}
                            placeholder={placeholder}
                            defaultValue={defaultValue}
                            value={value}
                            onChange={onChange}
                            className="input input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-secondary/50 focus:outline-none focus:bg-base-300"
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                        {type === "password" && (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 mx-1.5 -translate-y-1/2"
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
