import Image from 'next/image';

export const Loading = () => {
    return (
        <div
            aria-busy="true"
            role="status"
            aria-labelledby="hub-loading-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-hub-bg"
        >
            <div className="flex flex-col items-center gap-6 px-6 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
                    <span
                        aria-hidden
                        className="absolute inset-0 animate-spin rounded-full border-4 border-hub-border border-t-hub-primary"
                    />
                    <Image
                        priority
                        alt=""
                        src="/favicon.ico"
                        width={40}
                        height={40}
                        className="relative z-10 rounded-md"
                    />
                </div>

                <div>
                    <h1
                        id="hub-loading-title"
                        className="text-xl font-semibold text-hub-title md:text-2xl"
                    >
                        Chỉ một chút nữa thôi!
                    </h1>
                    <p className="mt-2 text-sm text-hub-muted md:text-base">
                        Chúng tôi đang chuẩn bị mọi thứ cho bạn!
                    </p>
                </div>
                <span className="sr-only" data-i18n-key="loading.title">
                    loading.title
                </span>
                <span className="sr-only" data-i18n-key="loading.subtitle">
                    loading.subtitle
                </span>
            </div>
        </div>
    );
};
