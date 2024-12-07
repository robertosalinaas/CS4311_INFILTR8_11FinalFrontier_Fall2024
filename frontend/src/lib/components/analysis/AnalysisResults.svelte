<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import CSVModal from './CSVModal.svelte';
    import { handleCreatePdfReport } from '$lib/utils/handleCreatePDF';
    import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
    import SuccessMessage from '$lib/components/common/SuccessMessage.svelte';

    export let results: {
        projectId: string;
        data_with_exploits: string;
        ranked_entry_points: string;
        entrypoint_most_info: string;
        port_0_entries: string;
    };

    $: isDarkMode = $settings.theme === "dark";

    let showModal = false;
    let currentCSVData = '';
    let errorMessage: string | null = null;
    let successMessage: string | null = null;

    function downloadFile(content: string, filename: string) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    function openModal(csvData: string) {
        currentCSVData = csvData;
        showModal = true;
    }

    async function handlePdfDownload() {
        const result = await handleCreatePdfReport({
            data_with_exploits: results.data_with_exploits,
            ranked_entry_points: results.ranked_entry_points,
            entrypoint_most_info: results.entrypoint_most_info,
            port_0_entries: results.port_0_entries
        });
        
        if (result.error) {
            errorMessage = result.error;
            setTimeout(() => {
                errorMessage = null;
            }, 5000);
        } else if (result.successMessage) {
            successMessage = result.successMessage;
            setTimeout(() => {
                successMessage = null;
            }, 5000);
        }
    }
</script>

<div class="mt-6 p-6 rounded-lg shadow-lg {isDarkMode ? 'bg-gray-800' : 'bg-white'}">
    <h3 class="text-lg font-medium mb-4 {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">
        Analysis Results
    </h3>

    {#if errorMessage}
        <ErrorMessage message={errorMessage} />
    {/if}

    {#if successMessage}
        <SuccessMessage message={successMessage} />
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Complete Data with Exploits -->
        <div class="p-4 rounded-lg border {isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}">
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-slate-700'}">
                    Complete Analysis Data
                </h4>
                <button
                    on:click={() => downloadFile(results.data_with_exploits, 'data_with_exploits.csv')}
                    class="px-3 py-1 text-sm rounded-md transition-colors duration-200
                        {isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-400' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}"
                    aria-label="Download complete analysis data as CSV"
                >
                    Download CSV
                </button>
            </div>
            <button
                on:click={() => openModal(results.data_with_exploits)}
                class="w-full mt-2 px-4 py-2 text-sm rounded-md transition-colors duration-200
                    {isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-400' 
                        : 'bg-blue-200 hover:bg-blue-300 text-slate-700'}"
                aria-label="View complete analysis data"
            >
                View Complete Analysis Data
            </button>
        </div>

        <!-- Ranked Entry Points -->
        <div class="p-4 rounded-lg border {isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}">
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-slate-700'}">
                    Ranked Entry Points
                </h4>
                <button
                    on:click={() => downloadFile(results.ranked_entry_points, 'ranked_entry_points.csv')}
                    class="px-3 py-1 text-sm rounded-md transition-colors duration-200
                        {isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-400' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}"
                    aria-label="Download ranked entry points as CSV"
                >
                    Download CSV
                </button>
            </div>
            <button
                on:click={() => openModal(results.ranked_entry_points)}
                class="w-full mt-2 px-4 py-2 text-sm rounded-md transition-colors duration-200
                    {isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-400' 
                        : 'bg-blue-200 hover:bg-blue-300 text-slate-700'}"
                aria-label="View ranked entry points"
            >
                View Ranked Entry Points
            </button>
        </div>

        <!-- Entry Points with Most Information -->
        <div class="p-4 rounded-lg border {isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}">
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-slate-700'}">
                    Entry Points Details
                </h4>
                <button
                    on:click={() => downloadFile(results.entrypoint_most_info, 'entrypoint_most_info.csv')}
                    class="px-3 py-1 text-sm rounded-md transition-colors duration-200
                        {isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-400' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}"
                    aria-label="Download entry points details as CSV"
                >
                    Download CSV
                </button>
            </div>
            <button
                on:click={() => openModal(results.entrypoint_most_info)}
                class="w-full mt-2 px-4 py-2 text-sm rounded-md transition-colors duration-200
                    {isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-400' 
                        : 'bg-blue-200 hover:bg-blue-300 text-slate-700'}"
                aria-label="View entry points details"
            >
                View Entry Points Details
            </button>
        </div>

        <!-- Port 0 Entries -->
        <div class="p-4 rounded-lg border {isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'}">
            <div class="flex justify-between items-center mb-2">
                <h4 class="text-sm font-medium {isDarkMode ? 'text-gray-300' : 'text-slate-700'}">
                    Port 0 Entries
                </h4>
                <button
                    on:click={() => downloadFile(results.port_0_entries, 'port_0_entries.csv')}
                    class="px-3 py-1 text-sm rounded-md transition-colors duration-200
                        {isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-400' 
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}"
                    aria-label="Download port 0 entries as CSV"
                >
                    Download CSV
                </button>
            </div>
            <button
                on:click={() => openModal(results.port_0_entries)}
                class="w-full mt-2 px-4 py-2 text-sm rounded-md transition-colors duration-200
                    {isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-400' 
                        : 'bg-blue-200 hover:bg-blue-300 text-slate-700'}"
                aria-label="View port 0 entries"
            >
                View Port 0 Entries
            </button>
        </div>
    </div>

    <!-- PDF Download Button -->
    <div class="mt-6 flex justify-center">
        <button
            on:click={handlePdfDownload}
            class="px-6 py-3 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2
                {isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-400' 
                    : 'bg-green-200 hover:bg-green-300 text-slate-700'}"
            aria-label="Download complete PDF report"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Complete PDF Report</span>
        </button>
    </div>
</div>

{#if showModal}
    <CSVModal csvData={currentCSVData} on:close={() => showModal = false} />
{/if}