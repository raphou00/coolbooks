import { getUser } from "@/lib/auth";
import { redirect } from "@/lib/navigation";

const Layout = async ({ children }: React.PropsWithChildren) => {
    const user = await getUser();

    if (user?.user?.role !== "ADMIN") {
        return redirect("/");
    }

    return children;
};

export default Layout;
