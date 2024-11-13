<script lang="ts">
    import { onMount } from 'svelte';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';

    export let isOpen = true;

    // Apply text size to document root when it changes
    $: if (typeof window !== 'undefined') {
        document.documentElement.style.fontSize = `${$settings.textSize}px`;
    }

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
</script>

<Navbar bind:isOpen />

<div class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-4xl mx-auto">
        <!-- Settings Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold {themeClasses.text}">Settings</h1>
            <p class="{themeClasses.subtext} mt-2">Customize your application experience</p>
        </div>

        <div class="grid gap-8">
            <!-- Theme Settings -->
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">
                    Theme Preferences
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Light Theme -->
                    <button
                        class="relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4
                        {$settings.theme === 'light' 
                            ? 'border-blue-500 bg-blue-50/50' 
                            : themeClasses.border}"
                        on:click={() => settings.setTheme('light')}
                    >
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-medium {themeClasses.text}">Light</span>
                            <span class="text-sm {themeClasses.subtext}">Default theme</span>
                        </div>
                        {#if $settings.theme === 'light'}
                            <div class="absolute top-3 right-3 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        {/if}
                    </button>

                    <!-- Dark Theme -->
                    <button
                        class="relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4
                        {$settings.theme === 'dark' 
                            ? 'border-blue-500 bg-gray-800/50' 
                            : themeClasses.border}"
                        on:click={() => settings.setTheme('dark')}
                    >
                        <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-medium {themeClasses.text}">Dark</span>
                            <span class="text-sm {themeClasses.subtext}">Easier on the eyes</span>
                        </div>
                        {#if $settings.theme === 'dark'}
                            <div class="absolute top-3 right-3 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        {/if}
                    </button>

                    <!-- Colorblind Theme -->
                    <button
                        class="relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4
                        {$settings.theme === 'colorblind' 
                            ? 'border-blue-500 bg-yellow-100/50' 
                            : themeClasses.border}"
                        on:click={() => settings.setTheme('colorblind')}
                    >
                        <div class="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <div class="text-center">
                            <span class="block text-lg font-medium {themeClasses.text}">Colorblind</span>
                            <span class="text-sm {themeClasses.subtext}">High contrast mode</span>
                        </div>
                        {#if $settings.theme === 'colorblind'}
                            <div class="absolute top-3 right-3 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        {/if}
                    </button>
                </div>
            </div>

            <!-- Text Size Settings -->
            <div class="{themeClasses.card} rounded-xl shadow-lg p-8">
                <h2 class="text-2xl font-semibold mb-6 {themeClasses.text}">
                    Text Size
                </h2>
                
                <div class="space-y-6">
                    <!-- Text Size Slider -->
                    <div class="flex items-center gap-6">
                        <span class="text-sm {themeClasses.subtext} w-8">Aa</span>
                        <div class="flex-grow">
                            <input 
                                type="range" 
                                min="12" 
                                max="24" 
                                step="1"
                                bind:value={$settings.textSize}
                                on:change={() => settings.setTextSize($settings.textSize)}
                                class="w-full slider-custom"
                            />
                        </div>
                        <span class="text-xl {themeClasses.subtext} w-8">Aa</span>
                    </div>

                    <!-- Preview Text -->
                    <div class="p-6 rounded-lg {$settings.theme === 'light' ? 'bg-gray-50' : $settings.theme === 'dark' ? 'bg-gray-800/50' : 'bg-yellow-50'}">
                        <h3 class="font-semibold mb-2 {themeClasses.text}" style="font-size: {$settings.textSize}px">
                            Preview Text
                        </h3>
                        <p class={themeClasses.subtext} style="font-size: {$settings.textSize}px">
                            This is how your text will look across the application. Adjust the slider to find the perfect size for your needs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

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

    /* Custom slider styling */
    .slider-custom {
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        border-radius: 8px;
        background: #e2e8f0;
        outline: none;
    }

    .slider-custom::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    }

    .slider-custom::-webkit-slider-thumb:hover {
        background: #2563eb;
        transform: scale(1.1);
    }

    .slider-custom::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    }

    .slider-custom::-moz-range-thumb:hover {
        background: #2563eb;
        transform: scale(1.1);
    }
</style>