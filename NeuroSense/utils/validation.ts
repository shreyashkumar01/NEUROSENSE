export const validatePhoneNumber = (phone: string): { isValid: boolean, value: string, error?: string } => {
    const cleanNumber = phone.replace(/\D/g, '');
    if (!cleanNumber) return { isValid: false, value: '', error: 'Phone number is required' };

    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) return { isValid: true, value: cleanNumber };
    if (cleanNumber.startsWith('1') && cleanNumber.length === 11) return { isValid: true, value: cleanNumber };
    if (cleanNumber.length === 10) return { isValid: true, value: cleanNumber };

    return { isValid: false, value: cleanNumber, error: 'Invalid phone format. Please enter a valid 10-digit number.' };
};

export const validateEmail = (email: string): { isValid: boolean, error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, error: 'Email is required' };
    if (!emailRegex.test(email)) return { isValid: false, error: 'Invalid email format' };
    return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean, error?: string } => {
    if (!password) return { isValid: false, error: 'Password is required' };
    if (password.length < 8) return { isValid: false, error: 'Password must be at least 8 characters' };
    return { isValid: true };
};

export const validateLicenseId = (licenseId: string): { isValid: boolean, error?: string } => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!licenseId) return { isValid: false, error: 'License ID is required' };
    if (licenseId.length < 5) return { isValid: false, error: 'License ID must be at least 5 characters' };
    if (!alphanumericRegex.test(licenseId)) return { isValid: false, error: 'License ID must be alphanumeric' };
    return { isValid: true };
};
