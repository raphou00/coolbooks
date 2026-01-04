import { Controller, type Control, type FieldError } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FormSelectProps = {
    name: string;
    label: string;
    values: string[];
    control: Control<any>;
    error?: FieldError | string | null;
    defaultValue?: string;
    t?: any;
};

const FormSelect: React.FC<FormSelectProps> = ({
    name,
    label,
    values,
    control,
    error,
    defaultValue = "",
    t,
}) => {
    return (
        <div className="w-full my-2">
            <label className="w-full text-sm">
                <div className="w-full flex justify-between pb-1">
                    <span className="label-text px-1 font-bold">{label}</span>
                    <span className="label-text-alt text-error">
                        {typeof error === "string" ? error : error?.message}
                    </span>
                </div>
                <div className="relative w-full">
                    <Controller
                        name={name}
                        control={control}
                        defaultValue={defaultValue}
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
                                                <div className="flex items-center gap-2">
                                                    {t ? t(e) : e}
                                                </div>
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
