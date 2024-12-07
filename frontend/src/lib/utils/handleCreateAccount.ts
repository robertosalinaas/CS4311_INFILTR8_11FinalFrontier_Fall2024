const API_BASE_URL = 'http://localhost:3000/api';

interface AuthResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
    userKey?: string;
    showUserKey?: boolean;
}

interface CreateAccountForm {
    username: string;
    password: string;
    confirmPassword: string;
}

function isValidPassword(password: string): boolean {
    // At least 8 characters
    // At least one uppercase letter
    // At least one lowercase letter
    // At least one number
    // At least one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function validateCreateAccountForm(form: CreateAccountForm): string | null {
    // Check for empty fields
    if (!form.username || !form.password || !form.confirmPassword) {
        return "All fields are required";
    }

    // Username validation
    if (form.username.length < 3) {
        return "Username must be at least 3 characters long";
    }

    // Password validation
    if (!isValidPassword(form.password)) {
        return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    // Password confirmation
    if (form.password !== form.confirmPassword) {
        return "Passwords do not match";
    }

    return null;
}

export async function handleCreateAccount(event: Event, createAccountForm: CreateAccountForm): Promise<AuthResponse> {
    event.preventDefault();

    try {
        // Client-side validation
        const validationError = validateCreateAccountForm(createAccountForm);
        if (validationError) {
            return {
                isLoading: false,
                error: validationError
            };
        }

        const response = await fetch(`${API_BASE_URL}/create-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createAccountForm)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            return {
                isLoading: false,
                error: data.error || "Failed to create account!"
            };
        }
  
        return {
            isLoading: false,
            successMessage: "Account created successfully!",
            userKey: data.userKey,
            showUserKey: true
        };
    
    } catch (e) {
        return {
            isLoading: false,
            error: "Network error occurred"
        };
    }
}