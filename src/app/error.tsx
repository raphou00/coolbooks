"use client";

import Error from "@/components/ui/error";

const RootError: React.FC<{ error: Error }> = ({ error }) => {
    console.error(error);
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Error />
            {error.message}
        </div>
    );
};

export default RootError;
