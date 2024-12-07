const API_BASE_URL = 'http://localhost:3000/api';

interface ResetPasswordResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
}

interface ResetPasswordForm {
    userKey: string;
    newPassword: string;
    confirmPassword: string;
}

// Validation functions
function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function validateResetPasswordForm(form: ResetPasswordForm): string | null {
    // Check for empty fields
    if (!form.userKey || !form.newPassword || !form.confirmPassword) {
        return "All fields are required";
    }

    // User key validation
    if (form.userKey.length !== 64) { // assuming the key is 32 bytes hex encoded
        return "Invalid user key format";
    }

    // Password validation
    if (!isValidPassword(form.newPassword)) {
        return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    // Password confirmation
    if (form.newPassword !== form.confirmPassword) {
        return "Passwords do not match";
    }

    return null;
}

export async function handleResetPassword(event: Event, resetPasswordForm: ResetPasswordForm): Promise<ResetPasswordResponse> {
    event.preventDefault();

    try {
        // Client-side validation
        const validationError = validateResetPasswordForm(resetPasswordForm);
        if (validationError) {
            return {
                isLoading: false,
                error: validationError
            };
        }

        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(resetPasswordForm)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            return {
                isLoading: false,
                error: data.error || "Failed to reset password!"
            };
        }
  
        return {
            isLoading: false,
            successMessage: "Password reset successfully!"
        };
    
    } catch (e) {
        return {
            isLoading: false,
            error: "Network error occurred"
        };
    }
}