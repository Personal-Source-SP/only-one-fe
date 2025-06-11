import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, memo } from 'react';

const Loading: FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
            <div className="text-center">
                {/* Animated ball with logo */}
                <motion.div
                    className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8"
                    animate={{
                        y: [-20, 0, -20],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1.2,
                        ease: 'easeInOut',
                        times: [0, 0.5, 1],
                        repeat: Infinity,
                    }}
                >
                    <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                        <Icon icon="lucide:circle" className="text-white text-4xl md:text-5xl" />
                    </div>
                    {/* Shadow effect */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full"
                        animate={{
                            scale: [1, 0.9, 1],
                            opacity: [0.6, 0.4, 0.6],
                        }}
                        transition={{
                            duration: 1.2,
                            ease: 'easeInOut',
                            times: [0, 0.5, 1],
                            repeat: Infinity,
                        }}
                    />
                </motion.div>

                {/* Main message */}
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                    Chỉ một chút nữa thôi!
                </h1>

                {/* Blinking secondary message */}
                <motion.p
                    className="text-base md:text-lg text-gray-600"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Chúng tôi đang chuẩn bị mọi thứ cho bạn!
                </motion.p>

                {/* Background spinner */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        className="w-48 h-48 md:w-64 md:h-64 border-4 border-blue-200 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default memo(Loading);
