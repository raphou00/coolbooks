/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";
import type { GirlWithMedia } from "@/components/ui/girls";
import Title from "@/components/ui/title";

const CreateGirl: React.FC = () => {
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

        const res = await handleFormPost("/api/admin/girl", formData, {
            "Content-Type": "multipart/form-data",
        });
        setState(res);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex flex-col gap-y-2"
        >
            <Title text="Create Girl" />

            <FormReponse success={state.success} message={state.message} />

            <FormInput
                type="text"
                label="Name"
                placeholder="Name..."
                {...register("name")}
            />

            <FormInput
                type="text"
                label="Username"
                placeholder="Username..."
                {...register("username")}
            />

            <FormInput
                type="text"
                label="Origin"
                placeholder="Origin..."
                {...register("origin")}
            />

            <FormInput
                type="number"
                label="Price"
                placeholder="Price..."
                {...register("price")}
            />

            <FormInput
                type="number"
                label="Likes"
                placeholder="Likes..."
                {...register("likes")}
            />

            <FormInput
                type="text"
                label="tags"
                placeholder="cute,teeen,..."
                {...register("tags")}
            />

            <textarea
                className="textarea textarea-bordered"
                placeholder="Bio..."
                {...register("bio")}
            />

            <div className="flex">
                <label htmlFor="">Avatar</label>
                <input
                    type="file"
                    className="file-input"
                    {...register("avatar")}
                />
            </div>

            <div className="flex">
                <label htmlFor="">Cover</label>
                <input
                    type="file"
                    className="file-input"
                    {...register("cover")}
                />
            </div>

            <FormButton title="Create" loading={loading} />
        </form>
    );
};

const CreateMedia: React.FC<any> = ({ girls }) => {
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

        const res = await handleFormPost("/api/admin/media", formData, {
            "Content-Type": "multipart/form-data",
        });
        setState(res);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex flex-col gap-y-2"
        >
            <Title text="Create Media" />

            <FormReponse success={state.success} message={state.message} />

            <select className="select select-bordered" {...register("girlId")}>
                {girls.map((girl: any) => (
                    <option key={girl.id} value={girl.id}>
                        {girl.name}
                    </option>
                ))}
            </select>

            <FormInput
                type="text"
                label="Description"
                placeholder="Description..."
                {...register("description")}
            />

            <FormButton title="Create" loading={loading} />
        </form>
    );
};

const CreateImage: React.FC<any> = ({ girls }) => {
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

            <select className="select select-bordered" {...register("mediaId")}>
                {girls.map((girl: GirlWithMedia) => (
                    <>
                        {girl.medias.map((media: any) => (
                            <option key={media.id} value={media.id}>
                                {girl.name} | {media.description}
                            </option>
                        ))}
                    </>
                ))}
            </select>

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

const CreateVideo: React.FC<any> = ({ girls }) => {
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

            <select className="select select-bordered" {...register("mediaId")}>
                {girls.map((girl: GirlWithMedia) => (
                    <>
                        {girl.medias.map((media: any) => (
                            <option key={media.id} value={media.id}>
                                {girl.name} | {media.description}
                            </option>
                        ))}
                    </>
                ))}
            </select>

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

export { CreateGirl, CreateMedia, CreateImage, CreateVideo };
