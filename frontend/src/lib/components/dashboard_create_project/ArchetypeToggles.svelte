<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import { EXPLOITS } from "$lib/stores/constants";
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{
        change: string[];
    }>();

    export let selectedArchetypes: string[] = [];
    export let disabled: boolean = false;

    $: isDarkMode = $settings && $settings.theme === "dark";
    
    // Add a computed property to check if all archetypes are selected
    $: isAllSelected = EXPLOITS.every(archetype => selectedArchetypes.includes(archetype));

    function toggleArchetype(archetype: string) {
        const newSelection = selectedArchetypes.includes(archetype)
            ? selectedArchetypes.filter(a => a !== archetype)
            : [...selectedArchetypes, archetype];
        
        dispatch('change', newSelection);
    }

    // Add function to toggle all archetypes
    function toggleAll() {
        const newSelection = isAllSelected ? [] : [...EXPLOITS];
        dispatch('change', newSelection);
    }
</script>

<div class="space-y-4">
    <div class="space-y-2">
        <h4 class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-700'}">
            Allowed Archetypes
        </h4>
        <p class="text-sm {isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
            Select the archetypes you want to allow in this project:
        </p>
    </div>

    <div class="space-y-3 {disabled ? 'opacity-50 pointer-events-none' : ''}">
        <!-- Add "All" option -->
        <label 
            class="flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                {isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'}"
        >
            <span class="text-sm font-medium {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">
                All Archetypes
            </span>
            <button
                type="button"
                class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none
                    {isAllSelected
                        ? (isDarkMode ? 'bg-blue-600 border-blue-600' : 'bg-blue-600 border-blue-600')
                        : (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-200')}"
                role="switch"
                aria-checked={isAllSelected}
                aria-label="Toggle all archetypes"
                on:click|preventDefault={toggleAll}
            >
                <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        {isAllSelected ? 'translate-x-5' : 'translate-x-0'}"
                ></span>
            </button>
        </label>

        <!-- Existing archetype options -->
        {#each EXPLOITS as archetype}
            <label 
                class="flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                    {isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-white border-gray-200 hover:border-gray-300'}"
            >
                <span class="text-sm {isDarkMode ? 'text-gray-200' : 'text-gray-900'}">
                    {archetype}
                </span>
                <button
                    type="button"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none
                        {selectedArchetypes.includes(archetype)
                            ? (isDarkMode ? 'bg-blue-600 border-blue-600' : 'bg-blue-600 border-blue-600')
                            : (isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-200')}"
                    role="switch"
                    aria-checked={selectedArchetypes.includes(archetype)}
                    aria-label={`Toggle ${archetype} archetype ${selectedArchetypes.includes(archetype) ? 'off' : 'on'}`}
                    on:click|preventDefault={() => toggleArchetype(archetype)}
                >
                    <span
                        aria-hidden="true"
                        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            {selectedArchetypes.includes(archetype) ? 'translate-x-5' : 'translate-x-0'}"
                    ></span>
                </button>
            </label>
        {/each}
    </div>
</div>