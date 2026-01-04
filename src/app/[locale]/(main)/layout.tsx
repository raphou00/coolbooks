import { getUser } from "@/lib/auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const Layout: React.FC<React.PropsWithChildren> = async ({ children }) => {
    const user = await getUser();

    return (
        <Header user={user?.user || null}>
            {children}
            <Footer />
        </Header>
    );
};

export default Layout;
