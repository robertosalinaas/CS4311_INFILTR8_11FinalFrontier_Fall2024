export async function handleStartAnalysis(projectId: string) {
    try {
        window.dispatchEvent(new Event('analysisStarted'));

        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/api/start-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ projectId })
        });

        const data = await response.json();

        if (!response.ok) {
            window.dispatchEvent(new Event('analysisCompleted'));
            return {
                error: data.error || 'Failed to start analysis'
            };
        }

        // Poll for results
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        
        while (attempts < maxAttempts) {
            try {
                const pollResponse = await fetch(`http://localhost:3000/api/analysis-status/${projectId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!pollResponse.ok) {
                    throw new Error('Failed to fetch analysis status');
                }
                
                const pollData = await pollResponse.json();
                
                if (pollData.status === 'completed') {
                    window.dispatchEvent(new Event('analysisCompleted'));
                    return {
                        successMessage: 'Analysis completed successfully',
                        results: pollData.results
                    };
                } else if (pollData.status === 'failed') {
                    window.dispatchEvent(new Event('analysisCompleted'));
                    return {
                        error: pollData.error || 'Analysis failed'
                    };
                }
                
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            } catch (error) {
                console.warn('Polling error:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            }
        }

        window.dispatchEvent(new Event('analysisCompleted'));
        return {
            error: 'Analysis timed out'
        };

    } catch (error) {
        window.dispatchEvent(new Event('analysisCompleted'));
        return {
            error: error instanceof Error ? error.message : 'Failed to start analysis'
        };
    }
}