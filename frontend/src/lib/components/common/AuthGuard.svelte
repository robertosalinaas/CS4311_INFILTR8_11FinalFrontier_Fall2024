<script lang="ts">
    import { onMount, beforeUpdate, onDestroy } from 'svelte';
    import { goto, beforeNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { isLoggedIn } from '$lib/utils/handleLogOut';
    import { navigationStore } from '$lib/stores/navigationStore';
    
    let isAuthenticated = false;
    let isLoading = true;
    let unsubscribe: () => void;
    let mounted = false;
    let isAnalysisRunning = false;
    
    // Track navigation
    beforeNavigate(({ to, cancel }) => {
        if (to?.url.pathname === '/') {
            localStorage.clear();
            isAuthenticated = false;
        }
    });
    
    async function checkAuth() {
        if (!isLoggedIn()) {
            await goto('/');
            return false;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3000/api/verify-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.error === 'Server has been restarted, please login again') {
                    // Only clear and redirect if we're not in the middle of analysis
                    if (!isAnalysisRunning) {
                        localStorage.clear();
                        await goto('/');
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            // If it's a connection error and analysis is running, stay logged in
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                if (isAnalysisRunning) {
                    return true;
                }
                // Wait a bit and retry once
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    const token = localStorage.getItem('authToken');
                    const retryResponse = await fetch('http://localhost:3000/api/verify-token', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    return retryResponse.ok;
                } catch (retryError) {
                    // If retry fails and analysis is running, stay logged in
                    return isAnalysisRunning;
                }
            }
            // For other errors, only logout if we're not running analysis
            if (!isAnalysisRunning) {
                localStorage.clear();
                await goto('/');
                return false;
            }
            return true;
        }
    }
    
    // Listen for analysis start/end
    if (typeof window !== 'undefined') {
        window.addEventListener('analysisStarted', () => {
            isAnalysisRunning = true;
        });
        window.addEventListener('analysisCompleted', () => {
            isAnalysisRunning = false;
        });
    }
    
    onMount(async () => {
        mounted = true;

        // Subscribe to page changes
        unsubscribe = page.subscribe(async ($page) => {
            if ($page.url.pathname !== '/') {
                navigationStore.setLastRoute($page.url.pathname);
            }
        });

        isAuthenticated = await checkAuth();
        isLoading = false;
    });
    
    beforeUpdate(async () => {
        if (mounted && !isAuthenticated && !isLoading) {
            isAuthenticated = await checkAuth();
        }
    });
    
    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        mounted = false;
        // Clean up event listeners
        if (typeof window !== 'undefined') {
            window.removeEventListener('analysisStarted', () => {});
            window.removeEventListener('analysisCompleted', () => {});
        }
    });
    
    // Handle visibility change
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && mounted) {
                isAuthenticated = await checkAuth();
            }
        });
    }
</script>

{#if isLoading}
    <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
{:else if isAuthenticated}
    <slot />
{/if}