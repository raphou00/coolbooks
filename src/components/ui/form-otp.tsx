"use client";

import { OTPInput, type SlotProps } from "input-otp";
import { cn } from "@/lib/utils";

type FormOTPProps = {
    label: string;
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    error?: string | null;
    children: React.ReactNode;
};

const Slot: React.FC<SlotProps> = ({ isActive, char, hasFakeCaret }) => {
    return (
        <div
            className={cn(
                "relative size-16 text-[2rem]",
                "flex items-center justify-center",
                "transition-all",
                "border-y-2 border-r-2 border-neutral/50 first:rounded-l-xl first:border-l last:rounded-r-xl",
                "group-focus-within:border-secondary group-hover:border-secondary",
                "outline outline-0 outline-secondary",
                { "outline-4 outline-secondary": isActive }
            )}
        >
            {char !== null && <div>{char}</div>}
            {hasFakeCaret && <FakeCaret />}
        </div>
    );
};

const FakeCaret: React.FC = () => {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-px bg-white" />
        </div>
    );
};

const FormOTP: React.FC<FormOTPProps> = ({
    label,
    error,
    value,
    setValue,
    children,
}) => {
    return (
        <div className="mt-5 w-full">
            <label className="form-control w-full">
                <div className="label pt-0">
                    <span className="label-text">{label}</span>
                    <span className="label-text-alt text-error">{error}</span>
                </div>
                <div className="relative w-full">
                    <OTPInput
                        value={value}
                        onChange={setValue}
                        maxLength={6}
                        className="w-full"
                        containerClassName="group w-full flex items-center has-[:disabled]:opacity-30"
                        render={({ slots }) => (
                            <>
                                <div className="flex w-full">
                                    {slots.map((slot, idx) => (
                                        <Slot key={idx} {...slot} />
                                    ))}
                                </div>
                            </>
                        )}
                    />
                </div>
                {children}
            </label>
        </div>
    );
};

export default FormOTP;
