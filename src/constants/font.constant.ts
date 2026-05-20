import { Plus_Jakarta_Sans } from 'next/font/google';

export const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700'],
    variable: '--font-plus-jakarta',
});

/** @deprecated Use plusJakartaSans — kept for ColorModeContext import path */
export const inter = plusJakartaSans;
