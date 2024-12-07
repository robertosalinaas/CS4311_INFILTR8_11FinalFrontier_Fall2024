const API_BASE_URL = 'http://localhost:3000/api';

interface SignInResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
    username?: string;
    userKey?: string;  
    token?: string;
}

interface SignInForm {
    username: string;
    password: string;
}

function validateSignInForm(form: SignInForm): string | null {
    // Check for empty fields
    if (!form.username || !form.password) {
        return "All fields are required";
    }

    // Username validation
    if (form.username.length < 3) {
        return "Username must be at least 3 characters long";
    }

    return null;
}

export async function handleSignIn(event: Event, signInForm: SignInForm): Promise<SignInResponse> {
    event.preventDefault();

    try {
        // Client-side validation
        const validationError = validateSignInForm(signInForm);
        if (validationError) {
            return {
                isLoading: false,
                error: validationError
            };
        }

        const response = await fetch(`${API_BASE_URL}/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signInForm)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            return {
                isLoading: false,
                error: data.error || "Failed to sign in!"
            };
        }
  
        // Store token and user info in localStorage
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify({
                username: data.username,
                userKey: data.userKey,
                lastLogin: new Date().toISOString()
            }));
        }

        return {
            isLoading: false,
            successMessage: "Signed in successfully!",
            username: data.username,
            userKey: data.userKey,  
            token: data.token
        };
    
    } catch (e) {
        return {
            isLoading: false,
            error: "Network error occurred"
        };
    }
}