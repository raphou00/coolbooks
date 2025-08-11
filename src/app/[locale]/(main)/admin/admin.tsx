/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";
import Title from "@/components/ui/title";
import FormInput from "@/components/ui/form-input";

const CreateImage: React.FC = () => {
    const [state, setState] = useState<ActionsState<any>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm();

    const submit = async (data: any) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(
                key,
                value instanceof FileList ? value[0] : (value as string)
            );
        });

        const res = await handleFormPost("/api/admin/image", formData, {
            "Content-Type": "multipart/form-data",
        });
        setState(res);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex flex-col gap-y-2"
        >
            <Title text="Create Image" />
            <FormReponse success={state.success} message={state.message} />

            <FormInput
                type="text"
                label="Description"
                placeholder="Description"
                {...register("description")}
            />

            <div className="flex">
                <label htmlFor="">Free</label>
                <input
                    type="checkbox"
                    className="checkbox"
                    {...register("free")}
                />
            </div>

            <input type="file" className="file-input" {...register("image")} />

            <FormButton title="Create" loading={loading} />
        </form>
    );
};

const CreateVideo: React.FC = () => {
    const [state, setState] = useState<ActionsState<any>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm();

    const submit = async (data: any) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(
                key,
                value instanceof FileList ? value[0] : (value as string)
            );
        });

        const res = await handleFormPost("/api/admin/video", formData, {
            "Content-Type": "multipart/form-data",
        });
        setState(res);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex flex-col gap-y-2"
        >
            <Title text="Create Video" />

            <FormReponse success={state.success} message={state.message} />

            <FormInput
                type="text"
                label="Description"
                placeholder="Description"
                {...register("description")}
            />

            <div className="flex">
                <label htmlFor="">Free</label>
                <input
                    type="checkbox"
                    className="checkbox"
                    {...register("free")}
                />
            </div>

            <input type="file" className="file-input" {...register("video")} />

            <FormButton title="Create" loading={loading} />
        </form>
    );
};

export { CreateImage, CreateVideo };
