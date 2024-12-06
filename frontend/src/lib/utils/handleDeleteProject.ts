const API_BASE_URL = 'http://localhost:3000/api';

interface DeleteProjectResponse {
    isLoading: boolean;
    error?: string;
    success?: boolean;
    message?: string;
}

export async function handleDeleteProject(projectId: string): Promise<DeleteProjectResponse> {
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
            const response = await fetch(`${API_BASE_URL}/delete-project/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    isLoading: false,
                    error: data.error || "Failed to delete project!",
                    success: false
                };
            }

            return {
                isLoading: false,
                success: true,
                message: data.message || "Project deleted successfully"
            };

        } catch (parseError) {
            return {
                isLoading: false,
                error: "Invalid session data",
                success: false
            };
        }

    } catch (e) {
        return {
            isLoading: false,
            error: e instanceof Error ? e.message : "Network error occurred",
            success: false
        };
    }
}