import { navigationStore } from '$lib/stores/navigationStore';

const API_BASE_URL = 'http://localhost:3000/api';

interface LogoutResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
    username?: string;  
}

export async function handleLogout(): Promise<LogoutResponse> {
    try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            return {
                isLoading: false,
                error: "No active session found"
            };
        }

        try {
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    isLoading: false,
                    error: data.error || "Failed to logout!"
                };
            }

            // Clear all stored data and reset navigation
            localStorage.clear();
            navigationStore.reset();

            return {
                isLoading: false,
                successMessage: "Logged out successfully!",
                username: user.username  
            };

        } catch (parseError) {
            localStorage.clear();
            navigationStore.reset();
            return {
                isLoading: false,
                error: "Invalid session data"
            };
        }

    } catch (e) {
        return {
            isLoading: false,
            error: e instanceof Error ? e.message : "Network error occurred"
        };
    }
}

export function isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
}