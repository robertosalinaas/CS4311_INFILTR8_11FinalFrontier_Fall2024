const API_BASE_URL = 'http://localhost:3000/api';

interface AnalyzedProject {
    projectId: string;
    name: string;
    createdAt: string;
    analysisCompletedAt?: string;
    data_with_exploits?: string;
    ranked_entry_points?: string;
    entrypoint_most_info?: string;
    port_0_entries?: string;
    error?: string;
    scopeIPs: string[];
    offLimitIPs: string[];
    allowedExploits: string[];
    nessusFileName?: string;
    nessusFilePath?: string;
}

interface FetchAnalyzedProjectsResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
    projects?: AnalyzedProject[];
}

export async function handleFetchAnalyzedProjects(): Promise<FetchAnalyzedProjectsResponse> {
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
            const response = await fetch(`${API_BASE_URL}/fetch-analyzed-projects`, {
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
                    error: data.error || "Failed to fetch analyzed projects!"
                };
            }

            return {
                isLoading: false,
                successMessage: data.message,
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