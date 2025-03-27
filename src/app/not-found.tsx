import { redirect } from "@/lib/navigation";

const dynamic = "force-dynamic";

const RootNotFound = () => {
    redirect("/");
};

export { dynamic };
export default RootNotFound;
