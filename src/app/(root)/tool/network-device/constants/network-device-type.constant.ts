import { NetworkDeviceType } from '../enums';

export const DEVICE_TYPE_CONFIG: Record<
    NetworkDeviceType,
    { label: string; icon: string; color: string }
> = {
    [NetworkDeviceType.CAMERA]: {
        label: 'Camera IP / ONVIF',
        icon: 'noto:videocassette',
        color: 'blue',
    },
    [NetworkDeviceType.ROUTER_AP]: {
        label: 'Router / AP Wi-Fi',
        icon: 'noto:satellite-antenna',
        color: 'cyan',
    },
    [NetworkDeviceType.COMPUTER_PHONE]: {
        label: 'Máy tính / Điện thoại',
        icon: 'noto:laptop',
        color: 'geekblue',
    },
    [NetworkDeviceType.SMART_IOT]: {
        label: 'Thiết bị Smart IoT',
        icon: 'noto:light-bulb',
        color: 'gold',
    },
    [NetworkDeviceType.PRINTER]: {
        label: 'Máy in / Scan',
        icon: 'noto:printer',
        color: 'purple',
    },
    [NetworkDeviceType.UNKNOWN]: {
        label: 'Chưa phân loại',
        icon: 'noto:question-mark',
        color: 'default',
    },
};
