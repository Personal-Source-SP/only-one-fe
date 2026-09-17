import { NetworkDeviceApproachEnum } from '../enums';

export const APPROACH_CONFIG: Record<
    NetworkDeviceApproachEnum,
    { label: string; description: string }
> = {
    [NetworkDeviceApproachEnum.NETWORK_DISCOVERY]: {
        label: 'Khám phá Subnet (NETWORK_DISCOVERY)',
        description: 'Quét toàn dải IP qua ONVIF probe và ARP scanner',
    },
    [NetworkDeviceApproachEnum.PORT_SCAN]: {
        label: 'Quét Cổng Dịch Vụ (PORT_SCAN)',
        description: 'Kiểm tra trạng thái mở của các cổng TCP mục tiêu',
    },
    [NetworkDeviceApproachEnum.PROTOCOL_AUTH]: {
        label: 'Xác Thực Giao Thức (PROTOCOL_AUTH)',
        description: 'Xác thực tài khoản và trích xuất thông số ONVIF/RTSP',
    },
};
