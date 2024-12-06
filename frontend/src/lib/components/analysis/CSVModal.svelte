<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Papa from 'papaparse';
    import { settings } from "$lib/stores/settings";

    export let csvData: string;
    const dispatch = createEventDispatcher();

    let parsedData: any[] = [];
    let headers: string[] = [];

    $: isDarkMode = $settings.theme === "dark";

    $: if (csvData) {
        const result = Papa.parse(csvData, { header: true });
        parsedData = result.data;
        if (parsedData.length > 0) {
            headers = Object.keys(parsedData[0]);
        }
    }

    function closeModal() {
        dispatch('close');
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto main-expanded">
    <div class="max-w-4xl mx-auto pt-32 w-full px-6">
        <div class="rounded-lg shadow-lg overflow-hidden {isDarkMode ? 'bg-gray-800' : 'bg-white'}">
            <div class="sticky top-0 {isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 border-b flex justify-between items-center">
                <h2 class="text-lg font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">Data View</h2>
                <button 
                    class="p-2 rounded-full transition-colors duration-200
                        {isDarkMode 
                            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}"
                    on:click={closeModal}
                    aria-label="Close modal"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-4">
                {#if parsedData.length > 0}
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-auto">
                            <thead>
                                <tr class="{isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}">
                                    {#each headers as header}
                                        <th class="px-4 py-2 text-left text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">
                                            {header}
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody class="{isDarkMode ? 'bg-gray-800' : 'bg-white'}">
                                {#each parsedData as row}
                                    <tr class="border-b transition-colors
                                        {isDarkMode 
                                            ? 'border-gray-700 hover:bg-gray-700' 
                                            : 'border-gray-200 hover:bg-gray-50'}">
                                        {#each headers as header}
                                            <td class="px-4 py-2 text-sm {isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                                                {row[header]}
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                    <div class="text-center py-8">
                        <p class="{isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No data available</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom scrollbar styles */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 4px;
    }

    :global(.dark) ::-webkit-scrollbar-thumb {
        background: #4B5563;
    }

    :global(.dark) ::-webkit-scrollbar-thumb:hover {
        background: #6B7280;
    }

    ::-webkit-scrollbar-thumb {
        background: #CBD5E1;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #94A3B8;
    }

    /* Table styles */
    table {
        border-collapse: collapse;
        width: 100%;
    }

    th {
        position: sticky;
        top: 0;
        z-index: 10;
        background: inherit;
    }

    td, th {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
    }

    tr:hover td {
        white-space: normal;
        overflow: visible;
        max-width: none;
    }

    /* Inherit main-expanded class */
    :global(.main-expanded) {
        margin-left: 250px;
    }

    @media (max-width: 768px) {
        :global(.main-expanded) {
            margin-left: 0;
        }
    }
</style>