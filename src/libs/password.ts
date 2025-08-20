import bcrypt from 'bcryptjs';

export class PasswordService {
    private static readonly SALT_ROUNDS = 12;

    /**
     * Hash password
     */
    static async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (error) {
            console.error('Error hashing password:', error);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Compare password with hash
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Error comparing password:', error);
            return false;
        }
    }

    /**
     * Validate password strength
     */
    static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Mật khẩu phải có ít nhất 8 ký tự');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
        }

        if (!/\d/.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 1 số');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
        }

        return {
            errors,
            isValid: errors.length === 0,
        };
    }

    /**
     * Generate random password
     */
    static generateRandomPassword(length: number = 12): string {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        // Ensure at least one character from each category
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
        password += '0123456789'[Math.floor(Math.random() * 10)]; // number
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }
}
