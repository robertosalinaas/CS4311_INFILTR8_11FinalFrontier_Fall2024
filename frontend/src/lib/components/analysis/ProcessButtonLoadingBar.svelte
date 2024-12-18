<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let disabled: boolean = false;
    export let onClick: () => Promise<void>;
    let loading: boolean = false;

    $: isDarkMode = $settings.theme === "dark";

    // Tweened progress for the loading bar
    const progress = tweened(0, {
        duration: 0, // Set initial duration to 0
        easing: cubicOut
    });

    async function handleClick() {
        if (!disabled && !loading) {
            loading = true;
            progress.set(0, { duration: 0 }); // Reset progress
            
            // Start analysis process
            const analysisPromise = onClick();
            
            // Update progress while analysis is running
            const updateProgress = async () => {
                for (let i = 0; i <= 95; i += 5) {
                    if (!loading) break; // Stop if analysis completed early
                    await new Promise(resolve => setTimeout(resolve, 150)); // Adjust timing as needed
                    progress.set(i, { duration: 100 });
                }
            };

            // Run both promises concurrently
            try {
                await Promise.all([analysisPromise, updateProgress()]);
                progress.set(100, { duration: 200 }); // Quick final progress
                dispatch('analysisComplete', { success: true, message: 'Analysis completed successfully!' });
            } catch (error) {
                dispatch('analysisComplete', { success: false, message: 'Analysis failed. Please try again.' });
            } finally {
                loading = false;
            }
        }
    }

    export function resetLoading() {
        loading = false;
        progress.set(0, { duration: 0 });
    }
</script>

<div class="space-y-4">
    <!-- Process Button -->
    <button
        class="w-full flex justify-center items-center px-4 py-3 border text-sm font-medium rounded-md shadow-sm
            {isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500 border-gray-600 text-gray-200'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border-transparent text-white'}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
        disabled={disabled || loading}
        on:click={handleClick}
    >
        {#if loading}
            <span>Processing...</span>
        {:else}
            <span>Start Analysis</span>
        {/if}
    </button>

    <!-- Loading Bar - Only show when loading -->
    {#if loading}
        <div class="relative pt-1">
            <div class="overflow-hidden h-2 text-xs flex rounded-full 
                {isDarkMode ? 'bg-gray-700' : 'bg-blue-200'}">
                <div
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center
                        {isDarkMode ? 'bg-gray-500' : 'bg-blue-500'}"
                    style="width: {$progress}%"
                >
                </div>
            </div>
            <!-- Optional: Show percentage -->
            <div class="mt-2 text-center text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
                {Math.round($progress)}% Complete
            </div>
        </div>

        <!-- Status Messages -->
        <div class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1">
            {#if $progress < 30}
                <p>Initializing analysis...</p>
            {:else if $progress < 60}
                <p>Scanning vulnerabilities...</p>
            {:else if $progress < 90}
                <p>Processing results...</p>
            {:else}
                <p>Finalizing report...</p>
            {/if}
        </div>
    {/if}
</div>