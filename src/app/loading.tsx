import Logo from "@/components/ui/logo";

const RootLoading = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Logo className="size-20 animate-spin" />
        </div>
    );
};

export default RootLoading;
