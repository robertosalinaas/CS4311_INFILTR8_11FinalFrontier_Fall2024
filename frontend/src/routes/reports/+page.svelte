<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';

    export let isOpen = true;

    interface Report {
        id: string;
        filename: string;
        type: string;
        createdAt: string;
    }

    interface Project {
        id: string;
        name: string;
        processedDate: string;
        reports: Report[];
    }

    let projects: Project[] = [];
    let loading = true;
    let error = '';

    // Theme-specific classes
    $: themeClasses = {
        container: $settings.theme === 'light' 
            ? 'bg-gray-100' 
            : $settings.theme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-yellow-50',
        card: $settings.theme === 'light'
            ? 'bg-white'
            : $settings.theme === 'dark'
                ? 'bg-gray-900'
                : 'bg-yellow-100',
        text: $settings.theme === 'light'
            ? 'text-gray-800'
            : $settings.theme === 'dark'
                ? 'text-gray-100'
                : 'text-gray-900',
        subtext: $settings.theme === 'light'
            ? 'text-gray-600'
            : $settings.theme === 'dark'
                ? 'text-gray-400'
                : 'text-gray-700',
        border: $settings.theme === 'light'
            ? 'border-gray-200'
            : $settings.theme === 'dark'
                ? 'border-gray-700'
                : 'border-yellow-200'
    };

    onMount(async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    try {
        console.log('Attempting to fetch reports...');
        const response = await fetch('http://localhost:3000/api/projects/reports', {
            headers: {
                'Authorization': sessionId,
                'Accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Full error response:', errorData);
            throw new Error(errorData.error || 'Failed to fetch reports');
        }

        const data = await response.json();
        console.log('Received data:', data);
        projects = data;
    } catch (err) {
        console.error('Full error object:', err);
        error = `Failed to load reports: ${err.message}`;
    } finally {
        loading = false;
    }
});

async function downloadReport(report: { id: string, filename: string }) {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        goto('/user_login');
        return;
    }

    try {
        console.log('Attempting to download report:', report); // Debug log
        
        const response = await fetch(`http://localhost:3000/reports/download/${report.id}`, {
            headers: {
                'Authorization': sessionId
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Download error response:', errorData);
            throw new Error(errorData.error || 'Failed to download report');
        }

        // Check if we got a JSON response (error) instead of a file
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to download report');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error('Download error:', err);
        error = `Failed to download report: ${err.message}`;
    }
}

    function formatDate(dateString: string): string {
    try {
        const timestamp = parseInt(dateString);
        if (isNaN(timestamp)) {
            return 'Date not available';
        }
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date not available';
    }
}
</script>

<Navbar bind:isOpen />

<main class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-7xl mx-auto space-y-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold {themeClasses.text}">Project Reports</h1>
            <p class="{themeClasses.subtext} mt-2">View and download reports from your processed projects</p>
        </div>

        {#if loading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        {:else if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">{error}</span>
            </div>
        {:else if projects.length === 0}
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8 text-center">
                <p class="{themeClasses.text} text-xl">No reports available yet.</p>
                <a href="/process" class="inline-block mt-4 text-blue-500 hover:underline">
                    Process a new project
                </a>
            </div>
        {:else}
            <!-- Projects Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each projects as project}
                    <div class="{themeClasses.card} rounded-xl shadow-lg overflow-hidden">
                        <div class="p-6">
                            <h2 class="text-xl font-semibold {themeClasses.text} mb-2">{project.name}</h2>
                            {#if project.processedDate}
                                <div class="flex items-center mb-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Processed
                                    </span>
                                    <span class="{themeClasses.subtext} text-sm ml-2">
                                        {formatDate(project.processedDate)}
                                    </span>
                                </div>
                            {/if}
                            
                            <!-- Reports List -->
                            <div class="mt-4 space-y-2">
                                {#each project.reports as report}
                                    <div class="flex items-center justify-between p-3 rounded-lg border {themeClasses.border} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div>
                                            <p class="{themeClasses.text}">{report.type}</p>
                                            <p class="{themeClasses.subtext} text-sm">
                                                {formatDate(report.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                        on:click={() => downloadReport({id: report.id, filename: report.filename})}
                                        class="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                        </svg>
                                        <span>Download</span>
                                    </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</main>

<style>
    :global(.main-expanded) {
        margin-left: 250px;
    }

    :global(.main-collapsed) {
        margin-left: 0;
    }

    @media (max-width: 768px) {
        :global(.main-expanded) {
            margin-left: 0;
        }
    }
</style>

