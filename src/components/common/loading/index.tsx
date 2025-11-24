import { Icon } from '@iconify/react';
import { Space } from 'antd';


const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
            <div className="text-center">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8">
                    <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                        <Icon icon="lucide:circle" className="text-white text-4xl md:text-5xl" />
                    </div>
                </div>

                {/* Main message */}
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                    Chỉ một chút nữa thôi!
                </h1>

                <p className="text-base md:text-lg text-gray-600">
                    Chúng tôi đang chuẩn bị mọi thứ cho bạn!
                </p>

                {/* Background spinner (static) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 md:w-64 md:h-64 border-4 border-blue-200 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default Loading;
