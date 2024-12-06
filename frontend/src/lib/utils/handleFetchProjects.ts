const API_BASE_URL = 'http://localhost:3000/api';

interface Project {
    id: string;
    name: string;
    nessusFileName: string | null;
    nessusFilePath: string | null;
    scopeIPs: Array<{ id: string; value: string }>;
    offLimitIPs: Array<{ id: string; value: string }>;
    allowedExploits: string[];
    createdAt: string;
}

interface ProjectsResponse {
    isLoading: boolean;
    error?: string;
    projects?: Project[];
}

export async function handleFetchProjects(): Promise<ProjectsResponse> {
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
            const response = await fetch(`${API_BASE_URL}/fetch-projects`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    isLoading: false,
                    error: data.error || "Failed to fetch projects!"
                };
            }

            return {
                isLoading: false,
                projects: data.projects
            };

        } catch (parseError) {
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

