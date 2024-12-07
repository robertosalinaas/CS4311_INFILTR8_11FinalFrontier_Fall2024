const API_BASE_URL = 'http://localhost:3000/api';

interface PdfResponse {
    isLoading: boolean;
    error?: string;
    successMessage?: string;
}

export async function handleCreatePdfReport(csvData: {
    data_with_exploits: string;
    ranked_entry_points: string;
    entrypoint_most_info: string;
    port_0_entries: string;
}): Promise<PdfResponse> {
    try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            return {
                isLoading: false,
                error: "No active session found"
            };
        }

        // Compress the data if possible
        const compressedData = {
            data_with_exploits: csvData.data_with_exploits.trim(),
            ranked_entry_points: csvData.ranked_entry_points.trim(),
            entrypoint_most_info: csvData.entrypoint_most_info.trim(),
            port_0_entries: csvData.port_0_entries.trim()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/create-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                },
                body: JSON.stringify({ csvData: compressedData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
                return {
                    isLoading: false,
                    error: errorData.error || "Failed to create PDF report!"
                };
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/pdf')) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'analysis_report.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                return {
                    isLoading: false,
                    successMessage: "PDF report downloaded successfully!"
                };
            } else {
                return {
                    isLoading: false,
                    error: "Invalid response format from server"
                };
            }

        } catch (parseError) {
            console.error('Error:', parseError);
            return {
                isLoading: false,
                error: "Error processing request"
            };
        }

    } catch (e) {
        console.error('Error:', e);
        return {
            isLoading: false,
            error: e instanceof Error ? e.message : "Network error occurred"
        };
    }
}