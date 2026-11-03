import {
    Controller,
    type Control,
    type FieldError,
    type FieldPath,
    type FieldValues,
    type PathValue,
} from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FormSelectProps<T extends FieldValues> = {
    name: FieldPath<T>;
    label: string;
    values: string[];
    control: Control<T>;
    error?: FieldError | string | null;
    defaultValue?: string;
    t?: any;
};

const FormSelect = <T extends FieldValues>({
    name,
    label,
    values,
    control,
    error,
    defaultValue = "",
    t,
}: FormSelectProps<T>) => {
    return (
        <div className="w-full">
            <label className="block w-full">
                <span className="flex items-baseline justify-between gap-2">
                    <span className="field-label">{label}</span>
                    {error && (
                        <span className="type-body text-error pb-1.5">
                            {typeof error === "string" ? error : error?.message}
                        </span>
                    )}
                </span>
                <div className="relative w-full">
                    <Controller
                        name={name}
                        control={control}
                        defaultValue={
                            defaultValue as PathValue<T, FieldPath<T>>
                        }
                        render={({ field }) => (
                            <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={defaultValue} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {values.map((e) => (
                                            <SelectItem key={e} value={e}>
                                                {t ? t(e) : e}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </label>
        </div>
    );
};

export default FormSelect;
