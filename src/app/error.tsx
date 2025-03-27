"use client";

import Error from "@/components/ui/error";

const RootError: React.FC = () => {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Error />
        </div>
    );
};

export default RootError;
