const Banner: React.FC = () => {
    return (
        <div className="w-full bg-gradient-to-r from-purple-100 via-yellow-50 to-green-100 border-b border-gray-200 px-4 py-2.5">
            <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    <span className="mr-1">🎉</span>
                    TwelveLabs models are now in Amazon Bedrock! Leading video
                    understanding meets with the scale of AWS infrastructure.
                    <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold ml-1 transition-colors duration-200"
                    >
                        Learn more here!
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Banner;
