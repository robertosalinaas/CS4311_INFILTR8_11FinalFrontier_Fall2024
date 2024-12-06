const API_BASE_URL = 'http://localhost:3000/api';

interface ProjectForm {
    name: string;
    nessusFileName: string | null;
    nessusFilePath: string | null;
    nessusFile: File | null;
    scopeIPs: Array<{ id: string; value: string }>;
    offLimitIPs: Array<{ id: string; value: string }>;
    allowedExploits: Array<{ id: string; value: string }>;
}

interface ProjectResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
    project?: any;
}

export async function handleCreateProject(event: Event, projectForm: ProjectForm): Promise<ProjectResponse> {
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
            const formData = new FormData();
            formData.append('name', projectForm.name);
            
            // Add the Nessus file if it exists
            if (projectForm.nessusFile) {
                formData.append('nessusFile', projectForm.nessusFile);
            }

            // Add other project data as JSON, with simplified IP arrays
            formData.append('projectData', JSON.stringify({
                scopeIPs: projectForm.scopeIPs,  // Keep the full objects for frontend use
                offLimitIPs: projectForm.offLimitIPs,  // Keep the full objects for frontend use
                allowedExploits: projectForm.allowedExploits.map(exploit => exploit.value),
                createdAt: new Date().toISOString()
            }));

            const response = await fetch(`${API_BASE_URL}/create-project`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    isLoading: false,
                    error: data.error || "Failed to create project!"
                };
            }

            // Transform the response data back into the format the frontend expects
            const transformedProject = {
                ...data.project,
                scopeIPs: data.project.scopeIPs.map((ip: string) => ({
                    id: crypto.randomUUID(),
                    value: ip
                })),
                offLimitIPs: data.project.offLimitIPs.map((ip: string) => ({
                    id: crypto.randomUUID(),
                    value: ip
                })),
                allowedExploits: data.project.allowedExploits.map((exploit: string) => ({
                    id: crypto.randomUUID(),
                    value: exploit
                }))
            };

            return {
                isLoading: false,
                successMessage: `Project "${projectForm.name}" created successfully!`,
                project: transformedProject
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