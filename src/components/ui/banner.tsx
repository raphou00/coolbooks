import Link from "next/link";

const Banner: React.FC = () => {
    return (
        <div className="w-full bg-gradient-to-r from-purple-100 via-yellow-50 to-green-100 border-b border-gray-200 px-4 py-1.5 rounded-2xl">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="mr-1">😸</span>
                    You can create your own bedtime stories in minutes using our
                    AI-powered platform.
                    <Link
                        href="/studio/new"
                        className="link link-secondary font-semibold ml-1 transition-colors duration-200"
                    >
                        Learn more here!
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Banner;
