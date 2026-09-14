'use client';

import { ContentSection } from '@/components/common';
import { ElementType } from '@/enums';
import { ApiEndpointCard } from './components/ApiEndpointCard';

const SettingSystemPage = () => {
    return (
        <ContentSection
            elementType={ElementType.CARD}
            title="Cấu hình Hệ thống & Endpoint"
            description="Quản lý địa chỉ ứng dụng nội bộ và công khai qua Cloudflare Tunnel."
        >
            <div className="max-w-4xl">
                <ApiEndpointCard />
            </div>
        </ContentSection>
    );
};

export default SettingSystemPage;
