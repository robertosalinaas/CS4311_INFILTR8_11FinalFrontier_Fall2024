<script lang="ts">
import { settings } from "$lib/stores/settings";

export let title: string;
export let subtitle: string;
export let highlight: string = "";
export let centered: boolean = true;

$: isDarkTheme = $settings.theme === "dark";
</script>
  
<header class={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-md py-8 mb-8`}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header Content -->
        <div class="flex flex-col items-center">
            <!-- Title -->
            <h1 class={`text-3xl lg:text-4xl font-bold ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'} ${centered ? 'text-center' : ''}`}>
                {#if highlight}
                    {title.split(highlight)[0]}
                    <!-- Highlighted Text -->
                    <span class={`${isDarkTheme ? 'text-gray-300': 'bg-gradient-to-r from-blue-600 to-green-600 text-transparent bg-clip-text'}`}>
                        {highlight}
                    </span>
                    {title.split(highlight)[1]}
                {:else}
                    {title}
                {/if}
            </h1>
            <!-- Subtitle -->
            <p class={`text-lg mt-3 ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                {subtitle}
            </p>
        </div>
    </div>
</header>
