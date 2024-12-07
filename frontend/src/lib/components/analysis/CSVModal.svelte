<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Papa from 'papaparse';
    import { settings } from "$lib/stores/settings";

    export let csvData: string;
    const dispatch = createEventDispatcher();

    let parsedData: any[] = [];
    let headers: string[] = [];
    let visibleHeaders: string[] = [];
    let searchTerm = '';
    let currentPage = 1;
    let showColumnSelector = false;
    let scrollContainer: HTMLDivElement;
    const itemsPerPage = 10;

    $: isDarkMode = $settings.theme === "dark";

    // Parse CSV data
    $: if (csvData) {
        const result = Papa.parse(csvData, { header: true });
        parsedData = result.data;
        if (parsedData.length > 0) {
            headers = Object.keys(parsedData[0]);
            visibleHeaders = [...headers];
        }
    }

    // Filter data based on search term
    $: filteredData = parsedData.filter(row => 
        Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination
    $: totalPages = Math.ceil(filteredData.length / itemsPerPage);
    $: paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function toggleColumn(header: string) {
        if (visibleHeaders.includes(header)) {
            visibleHeaders = visibleHeaders.filter(h => h !== header);
        } else {
            visibleHeaders = [...visibleHeaders, header];
        }
    }

    function closeModal() {
        dispatch('close');
    }

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
        }
    }

    function scrollLeft() {
        if (scrollContainer) {
            scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
        }
    }

    function scrollRight() {
        if (scrollContainer) {
            scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
        }
    }

    function toggleColumnSelector() {
        showColumnSelector = !showColumnSelector;
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto main-expanded">
    <div class="max-w-6xl mx-auto pt-32 w-full px-6">
        <div class="rounded-lg shadow-lg overflow-hidden {isDarkMode ? 'bg-gray-800' : 'bg-white'}">
            <!-- Header -->
            <div class="sticky top-0 {isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 border-b z-20">
                <div class="flex justify-between items-center mb-4">
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

                <!-- Controls -->
                <div class="flex flex-wrap gap-4 items-center">
                    <!-- Search -->
                    <div class="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            bind:value={searchTerm}
                            placeholder="Search..."
                            aria-label="Search data"
                            class="w-full px-3 py-2 rounded-md border transition-colors
                                {isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                    : 'bg-white border-gray-300 text-gray-900'}"
                        />
                    </div>

                    <!-- Column selector button -->
                    <div class="relative">
                        <button
                            on:click={toggleColumnSelector}
                            aria-label="Toggle column selector"
                            class="px-4 py-2 rounded-md border transition-colors
                                {isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                    : 'bg-white border-gray-300 text-gray-900'}"
                        >
                            Columns ({visibleHeaders.length})
                        </button>
                        
                        {#if showColumnSelector}
                            <div 
                                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-30"
                                style="max-height: 300px;"
                            >
                                <div class="rounded-md ring-1 ring-black ring-opacity-5 
                                    {isDarkMode ? 'bg-gray-700' : 'bg-white'}">
                                    <div class="py-1 overflow-auto">
                                        {#each headers as header}
                                            <label class="flex items-center px-4 py-2 hover:bg-opacity-10 hover:bg-gray-500 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleHeaders.includes(header)}
                                                    on:change={() => toggleColumn(header)}
                                                    class="mr-2"
                                                    aria-label="Toggle {header} column"
                                                />
                                                <span class={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                                                    {header}
                                                </span>
                                            </label>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Table with horizontal scroll controls -->
            <div class="p-4 relative">
                {#if paginatedData.length > 0}
                    <button
                        on:click={scrollLeft}
                        aria-label="Scroll table left"
                        class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full
                            {isDarkMode 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'} shadow-lg"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <button
                        on:click={scrollRight}
                        aria-label="Scroll table right"
                        class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full
                            {isDarkMode 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'} shadow-lg"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div class="overflow-x-auto px-8" bind:this={scrollContainer}>
                        <table class="min-w-full table-auto">
                            <thead>
                                <tr class="{isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}">
                                    {#each visibleHeaders as header}
                                        <th class="px-4 py-2 text-left text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">
                                            {header}
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody class="{isDarkMode ? 'bg-gray-800' : 'bg-white'}">
                                {#each paginatedData as row}
                                    <tr class="border-b
                                        {isDarkMode 
                                            ? 'border-gray-700' 
                                            : 'border-gray-200'}">
                                        {#each visibleHeaders as header}
                                            <td class="px-4 py-2 text-sm {isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                                                <div class="truncate">
                                                    {row[header]}
                                                </div>
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="mt-4 flex justify-between items-center">
                        <div class="{isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                        </div>
                        <div class="flex gap-2">
                            <button
                                on:click={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                                class="px-3 py-1 rounded-md transition-colors
                                    {isDarkMode 
                                        ? 'bg-gray-700 text-gray-200 disabled:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 disabled:bg-gray-50'}"
                            >
                                Previous
                            </button>
                            <button
                                on:click={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                aria-label="Next page"
                                class="px-3 py-1 rounded-md transition-colors
                                    {isDarkMode 
                                        ? 'bg-gray-700 text-gray-200 disabled:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 disabled:bg-gray-50'}"
                            >
                                Next
                            </button>
                        </div>
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