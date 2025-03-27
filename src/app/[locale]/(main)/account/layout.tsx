import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import { AccoutMenu } from "./account";
import React from "react";

const Layout = async ({ children }: React.PropsWithChildren) => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    return (
        <Main>
            <AccoutMenu user={user.user}>{children}</AccoutMenu>
        </Main>
    );
};

export default Layout;
