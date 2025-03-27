import { redirect } from "next/navigation";

const Page: React.FC = () => {
    return redirect("/account/profile");
};

export default Page;
