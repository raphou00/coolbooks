import { cn } from "@/lib/utils";

type FormProps = {
    title?: string;
    description?: string;
    className?: string;
    /** Kept for API compatibility; the wordmark now lives in the page chrome. */
    logo?: boolean;
    children: React.ReactNode;
};

const Form: React.FC<FormProps> = ({
    title,
    description,
    className,
    children,
}) => {
    return (
        <div className={cn("w-full max-w-sm", className)}>
            <div className="mb-8">
                {title && (
                    <h1 className="type-display-md text-ink text-balance">
                        {title}
                    </h1>
                )}
                {description && (
                    <p className="type-body-lg mt-3 text-body">{description}</p>
                )}
            </div>
            <div className="flex w-full flex-col">{children}</div>
        </div>
    );
};

export default Form;
