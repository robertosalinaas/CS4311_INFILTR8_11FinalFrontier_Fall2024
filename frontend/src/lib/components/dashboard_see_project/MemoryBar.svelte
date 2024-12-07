<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { handleStorageUsage, formatBytes } from '$lib/utils/handleStorageUsage';
    import { settings } from "$lib/stores/settings";

    const dispatch = createEventDispatcher();

    let totalSize = 0;
    let nessusSize = 0;
    let analysisSize = 0;
    let error = '';
    let loading = true;

    $: isDarkMode = $settings.theme === "dark";

    async function loadStorageUsage() {
        loading = true;
        const result = await handleStorageUsage();
        
        if (result.error) {
            error = result.error;
        } else if (result.success && result.data) {
            totalSize = result.data.totalSize;
            nessusSize = result.data.nessusSize;
            analysisSize = result.data.analysisSize;
            error = '';
        }
        loading = false;
    }

    export { loadStorageUsage as refresh };

    onMount(loadStorageUsage);
</script>

{#if loading}
    <div class="w-full max-w-2xl mx-auto mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div class="animate-pulse h-16">
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
    </div>
{:else if error}
    <div class="w-full max-w-2xl mx-auto mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <p class="text-red-500 dark:text-gray-300 text-center">{error}</p>
        <button 
            class="mt-2 text-sm text-blue-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-gray-300"
            on:click={loadStorageUsage}
        >
            Retry
        </button>
    </div>
{:else}
    <div class="w-full max-w-2xl mx-auto mb-6 p-4 {isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md">
        <div class="flex justify-between mb-2">
            <span class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}">Storage Statistics</span>
            <span class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}">
                Total: {formatBytes(totalSize)}
            </span>
        </div>
        <div class="mt-2 flex justify-between text-xs {isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
            <span>Nessus Files: {formatBytes(nessusSize)}</span>
            <span>Analysis Results: {formatBytes(analysisSize)}</span>
        </div>
    </div>
{/if}

<style>
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }

    button {
        transition: all 0.2s ease-in-out;
    }

    button:hover {
        transform: translateY(-1px);
    }

    button:active {
        transform: translateY(0);
    }
</style>