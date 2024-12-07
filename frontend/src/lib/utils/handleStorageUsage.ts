export async function handleStorageUsage() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/api/storage-usage', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.error || 'Failed to fetch storage usage'
            };
        }

        return {
            success: true,
            data: {
                totalSize: data.totalSize,
                nessusSize: data.nessusSize,
                analysisSize: data.analysisSize,
                maxSize: data.maxSize,
                usedPercentage: data.usedPercentage
            }
        };

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch storage usage'
        };
    }
}

// Helper function to format bytes to human-readable size
export function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}