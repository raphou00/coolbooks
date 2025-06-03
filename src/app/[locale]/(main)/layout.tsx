import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const Layout: React.FC<React.PropsWithChildren> = async ({ children }) => {
    const user = await getUser();

    let notifications: number = 0;
    if (user?.user) {
        notifications = await db.notification.count({
            where: {
                userId: user.user.id
            }
        })
    }

    return (
        <Header user={user?.user || null} notifications={notifications}>
            {children}
            <Footer />
        </Header>
    );
};

export default Layout;
