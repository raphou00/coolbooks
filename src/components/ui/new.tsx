/* eslint-disable react-hooks/incompatible-library */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    animate,
    useVelocity,
    useAnimationControls,
} from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ActionsState } from "@/lib/types";
import { cn, formatAmountForDisplay, getImage, requestAPI } from "@/lib/utils";
import { price } from "@/config/stripe";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormSelect from "@/components/ui/form-select";
import FormButton from "@/components/ui/form-button";
import bookSchema, {
    ageOptions,
    artStyleOptions,
    eyeColorOptions,
    genderOptions,
    hairColorOptions,
    skinToneOptions,
    type BookSchema,
} from "@/schema/book";
import { Lock, Mail, Paintbrush, PenLine, User } from "lucide-react";

const draggableCards = [
    {
        image: "f7d0cbd5-0155-4858-8313-94c3bc06245c/29e67629-80d6-4270-b7a9-30356f632d91.png",
        className: "absolute top-20 left-[2%] rotate-[5deg]",
    },
    {
        image: "879ae571-6882-4e78-b32e-abb9964fcf3f/5cae381f-122d-4281-84ed-28878ff3da9a.png",
        className: "absolute top-90 left-[3%] rotate-[-5deg]",
    },
    {
        image: "60fcc0bf-8d83-47f2-916b-3de8eaba8738/774abb4a-0c7d-47be-9251-688704e570b9.png",
        className: "absolute top-160 left-[1%] rotate-[8deg]",
    },
    {
        image: "83a7dc9e-f3ca-44d4-8d8b-65ed61b27d0d/a75ecaed-1c00-4f12-affa-f5c3b9977c68.png",
        className: "absolute top-20 right-[2%] rotate-[-10deg]",
    },
    {
        image: "3795c5ed-37cc-4b0e-8623-d8f2d15bbcb2/97079ac2-4353-4c21-8c09-88de40b10e1f.png",
        className: "absolute top-90 right-[2%] -rotate-[-8deg]",
    },
    {
        image: "4a323aaf-4147-450e-ba37-241fbbf41363/16f954d2-b172-488f-aada-2f534df65f94.png",
        className: "absolute top-160 right-[0%] rotate-[-7deg]",
    },
];

const genderImages: Record<string, string> = {
    boy: "👦",
    girl: "👧",
};

export const artStyleImages: Record<string, string> = {
    cartoon: "🎨",
    comics: "🧚🏻",
    anime: "💥",
    watercolor: "🎭",
};

const NewBook: React.FC = () => {
    const t = useTranslations("pages.new-book");
    const tBook = useTranslations();

    const [state, setState] = useState<ActionsState<BookSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });

    const {
        control,
        watch,
        register,
        handleSubmit,
        formState: { errors, isSubmitting: loading },
    } = useForm<BookSchema>({
        resolver: zodResolver(bookSchema(tBook)),
        defaultValues: {
            artStyle: artStyleOptions[0],
        },
    });

    const artStyle = watch("artStyle");
    const gender = watch("gender");

    const submit = async (data: BookSchema) => {
        const res = await requestAPI<BookSchema>(
            "POST",
            "/api/stripe/create-checkout",
            data
        );
        setState(res);
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full max-w-x mx-auto flex flex-col gap-y-6"
            >
                <FormReponse success={state.success} message={state.message} />

                <div className="space-y-2">
                    <span className="flex items-center gap-x-2 text-2xl px-1 font-bold mb-2">
                        <div className="flex items-center justify-center size-12 bg-primary/20 rounded-field">
                            <User className="size-7 text-primary" />
                        </div>
                        {t("child-details")}
                    </span>

                    <FormInput
                        type="text"
                        label={t("child-name")}
                        placeholder={t("child-name-placeholder")}
                        error={errors.childName?.message}
                        {...register("childName")}
                    />

                    <div className="w-full text-sm mt-4">
                        <div className="w-full flex justify-between pb-1">
                            <span className="label-text px-1 font-bold">
                                {t("gender")}
                            </span>
                            <span className="label-text-alt text-error">
                                {errors.gender?.message}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {genderOptions.map((g) => (
                                <label
                                    key={g}
                                    className={cn(
                                        "cursor-pointer flex flex-col items-center bg-base-100 border-2 border-neutral/30 rounded-2xl p-2 transition",
                                        "hover:shadow-md relative group",
                                        gender == g &&
                                            "border-primary bg-primary/20"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 m-0.5">
                                        {gender == g ?
                                            <div className="size-6 border-2 border-primary inset-ring-4 inset-ring-base-100 bg-primary rounded-full" />
                                        :   <div className="size-6 border-2 border-neutral/30 rounded-full" />
                                        }
                                    </div>
                                    <input
                                        type="radio"
                                        value={g}
                                        className="absolute left-2 top-2 opacity-0 group-checked:border-primary"
                                        {...register("gender")}
                                    />
                                    <span className="capitalize text-lg text-center">
                                        {genderImages[g]} {t(g)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                        <FormSelect
                            name="age"
                            label={t("age")}
                            defaultValue={ageOptions[0]}
                            values={ageOptions as unknown as string[]}
                            control={control}
                            error={errors.age?.message}
                        />

                        <FormSelect
                            name="hairColor"
                            label={t("hair-color")}
                            defaultValue={hairColorOptions[0]}
                            values={hairColorOptions as unknown as string[]}
                            control={control}
                            error={errors.hairColor?.message}
                            t={t}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                        <FormSelect
                            name="eyeColor"
                            label={t("eye-color")}
                            defaultValue={eyeColorOptions[0]}
                            values={eyeColorOptions as unknown as string[]}
                            control={control}
                            error={errors.eyeColor?.message}
                            t={t}
                        />
                        <FormSelect
                            name="skinTone"
                            label={t("skin-tone")}
                            defaultValue={skinToneOptions[0]}
                            values={skinToneOptions as unknown as string[]}
                            control={control}
                            error={errors.skinTone?.message}
                            t={t}
                        />
                    </div>
                </div>

                <div>
                    <div className="w-full text-sm">
                        <div className="w-full flex justify-between pb-1">
                            <span className="flex items-center gap-x-2 text-2xl px-1 font-bold mb-2">
                                <div className="flex items-center justify-center size-12 bg-secondary/20 rounded-field">
                                    <Paintbrush className="size-7 text-secondary" />
                                </div>
                                {t("art-style")}
                            </span>
                            <span className="label-text-alt text-error">
                                {errors.artStyle?.message}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {artStyleOptions.map((style) => (
                                <label
                                    key={style}
                                    className={cn(
                                        "cursor-pointer flex flex-col items-center bg-base-100 border-2 border-neutral/30 rounded-box p-2 transition",
                                        "hover:shadow-md relative group",
                                        artStyle === style &&
                                            "border-primary bg-primary/20"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 m-1">
                                        {artStyle === style ?
                                            <div className="size-6 border-2 border-primary inset-ring-4 inset-ring-base-100 bg-primary rounded-full" />
                                        :   <div className="size-6 border-2 border-neutral/30 rounded-full" />
                                        }
                                    </div>
                                    <input
                                        type="radio"
                                        value={style}
                                        className="absolute left-2 top-2 opacity-0"
                                        {...register("artStyle")}
                                    />
                                    <span className="text-lg">
                                        {artStyleImages[style]}
                                    </span>
                                    <span className="capitalize text-base text-center font-bold">
                                        {t(style)}
                                    </span>
                                    <span className="text-sm text-center">
                                        {t(`${style}-description`)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <span className="flex items-center gap-x-2 text-2xl px-1 font-bold mb-2">
                        <div className="flex items-center justify-center size-12 bg-green-500/20 rounded-field">
                            <PenLine className="size-7 text-green-500" />
                        </div>
                        {t("story-idea")}
                    </span>
                    <label className="w-full text-sm">
                        <div className="w-full flex justify-between pb-1">
                            <span className="label-text px-1 font-bold">
                                {t("prompt")}
                            </span>
                            <span className="label-text-alt text-error">
                                {errors.prompt?.message}
                            </span>
                        </div>
                        <textarea
                            placeholder={t("prompt-placeholder")}
                            className="textarea w-full rounded-box resize-none border-2 bg-base-100 transition placeholder:text-neutral-400 focus:border-primary/50 focus:outline-none focus:bg-base-300"
                            rows={5}
                            {...register("prompt")}
                        />
                    </label>
                </div>

                <div>
                    <span className="flex items-center gap-x-2 text-2xl px-1 font-bold mb-2">
                        <div className="flex items-center justify-center size-12 bg-info/20 rounded-field">
                            <Mail className="size-7 text-info" />
                        </div>
                        {t("email")}
                    </span>
                    <FormInput
                        type="text"
                        label={t("email")}
                        placeholder={t("email-placeholder")}
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <div className="flex items-center justify-left gap-x-2 mt-2">
                        <Lock className="size-5 text-neutral" />
                        <span className="text-sm text-neutral/80">
                            {t("email-info")}
                        </span>
                    </div>
                </div>

                <div className="bg-info/20 border border-info/20 rounded-box p-6 divide-x">
                    <div className="grid grid-cols-3 divide-x divide-info/30">
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm text-neutral uppercase tracking-wide mb-2">
                                {t("price")}
                            </span>
                            <span className="text-base">
                                {formatAmountForDisplay(price)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm text-neutral uppercase tracking-wide mb-2">
                                {t("delivery")}
                            </span>
                            <span className="text-base text-success/80">
                                {t("by-email")}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm text-neutral uppercase tracking-wide mb-2">
                                {t("time")}
                            </span>
                            <span className="text-base text-success/80">
                                {t("instant")}
                            </span>
                        </div>
                    </div>
                </div>

                <FormButton
                    title={t("generate")}
                    loading={loading}
                    className="mt-0"
                />
            </form>

            {draggableCards.map((e) => (
                <DraggableCardBody key={e.image} className={e.className}>
                    <Image
                        src={getImage(e.image)}
                        alt=""
                        width={512}
                        height={512}
                        className="pointer-events-none relative z-10 size-60 object-cover"
                    />
                </DraggableCardBody>
            ))}
        </>
    );
};

const DraggableCardBody: React.FC<{
    className?: string;
    children?: React.ReactNode;
}> = ({ className, children }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const controls = useAnimationControls();
    const [constraints, setConstraints] = useState({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    });

    const velocityX = useVelocity(mouseX);
    const velocityY = useVelocity(mouseY);

    const springConfig = {
        stiffness: 100,
        damping: 20,
        mass: 0.5,
    };

    const rotateX = useSpring(
        useTransform(mouseY, [-300, 300], [25, -25]),
        springConfig
    );
    const rotateY = useSpring(
        useTransform(mouseX, [-300, 300], [-25, 25]),
        springConfig
    );

    const opacity = useSpring(
        useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]),
        springConfig
    );

    useEffect(() => {
        const updateConstraints = () => {
            if (typeof window !== "undefined") {
                setConstraints({
                    top: -window.innerHeight / 2,
                    left: -window.innerWidth / 2,
                    right: window.innerWidth / 2,
                    bottom: window.innerHeight / 2,
                });
            }
        };

        updateConstraints();

        window.addEventListener("resize", updateConstraints);

        return () => {
            window.removeEventListener("resize", updateConstraints);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { width, height, left, top } =
            cardRef.current?.getBoundingClientRect() ?? {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
            };
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        mouseX.set(deltaX);
        mouseY.set(deltaY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            drag
            dragConstraints={constraints}
            onDragStart={() => {
                document.body.style.cursor = "grabbing";
            }}
            onDragEnd={(event, info) => {
                document.body.style.cursor = "default";

                controls.start({
                    rotateX: 0,
                    rotateY: 0,
                    transition: {
                        type: "spring",
                        ...springConfig,
                    },
                });
                const currentVelocityX = velocityX.get();
                const currentVelocityY = velocityY.get();

                const velocityMagnitude = Math.sqrt(
                    currentVelocityX * currentVelocityX +
                        currentVelocityY * currentVelocityY
                );
                const bounce = Math.min(0.8, velocityMagnitude / 1000);

                animate(info.point.x, info.point.x + currentVelocityX * 0.3, {
                    duration: 0.8,
                    ease: [0.2, 0, 0, 1],
                    bounce,
                    type: "spring",
                    stiffness: 50,
                    damping: 15,
                    mass: 0.8,
                });

                animate(info.point.y, info.point.y + currentVelocityY * 0.3, {
                    duration: 0.8,
                    ease: [0.2, 0, 0, 1],
                    bounce,
                    type: "spring",
                    stiffness: 50,
                    damping: 15,
                    mass: 0.8,
                });
            }}
            style={{
                rotateX,
                rotateY,
                opacity,
                willChange: "transform",
            }}
            animate={controls}
            whileHover={{ scale: 1.02 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative size-60 overflow-hidden rounded-box transform-3d max-[1280px]:hidden",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export default NewBook;
