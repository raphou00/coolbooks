import Logo from "@/components/ui/logo";

const RootLoading = () => {
    return (
        <div className="flex h-dvh w-full items-center justify-center bg-canvas">
            <Logo className="h-10 w-auto animate-pulse" />
        </div>
    );
};

export default RootLoading;
