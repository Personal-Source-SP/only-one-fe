/** User-safe messages for public auth flows (Vietnamese, no i18n layer). */
export const AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE =
    'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

export const AUTH_SIGN_IN_INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không đúng.';

export const AUTH_SIGN_IN_UNKNOWN_FAILURE_MESSAGE =
    'Không thể đăng nhập lúc này. Vui lòng thử lại sau.';

export const AUTH_REGISTER_UNKNOWN_FAILURE_MESSAGE =
    'Đăng ký thất bại. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';

export const mapNextAuthSignInErrorMessage = (error: string | undefined): string => {
    const trimmed = error?.trim();
    if (!trimmed) {
        return AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE;
    }

    const hasExtendedChar = [...trimmed].some((ch) => ch.charCodeAt(0) > 0x7f);
    if (hasExtendedChar) {
        return trimmed;
    }

    const normalized = trimmed.toLowerCase();

    if (
        normalized.includes('credentials') ||
        normalized.includes('invalid') ||
        normalized.includes('unauthorized')
    ) {
        return AUTH_SIGN_IN_INVALID_CREDENTIALS_MESSAGE;
    }

    return AUTH_SIGN_IN_UNKNOWN_FAILURE_MESSAGE;
};
