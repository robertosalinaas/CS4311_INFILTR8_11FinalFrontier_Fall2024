<script lang="ts">
    import { settings } from '$lib/stores/settings';
    import { themes } from '$lib/stores/themes';
  
    export let themeName: string;
    export let icon: string;
    export let label: string;
    export let description: string;
    export let themeClasses;
  
    $: isSelected = $settings.theme === themeName;
    $: isDarkMode = $settings.theme === 'dark';
    $: currentTheme = themes[themeName];
</script>
  
<button
    class="relative p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-4
      {isSelected ? 
        (isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-blue-500 bg-blue-50') : 
        themeClasses.border
      } 
      {themeClasses.card} hover:shadow-md"
    on:click={() => settings.setTheme(themeName)}
>
    <!-- Icon Container -->
    <div
      class="w-16 h-16 rounded-full flex items-center justify-center shadow-md 
        {isSelected ? 
          (isDarkMode ? 'bg-gray-950' : 'bg-white') : 
          'bg-gray-50 dark:bg-gray-900'}"
    >
      <div class="text-current {isDarkMode ? 'text-gray-300' : currentTheme.colors.iconColor}">
        {@html icon}
      </div>
    </div>
  
    <!-- Text Content -->
    <div class="text-center">
      <span class="block text-lg font-medium {themeClasses.text}">{label}</span>
      <span class="text-sm {themeClasses.subtext}">{description}</span>
    </div>
  
    <!-- Checkmark for Selected State -->
    {#if isSelected}
      <div class="absolute top-3 right-3 {isDarkMode ? 'text-gray-300' : currentTheme.colors.checkmark}">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    {/if}
</button>

<style>
    button {
      cursor: pointer;
    }

    button:focus {
      outline: none;
    }

    button:focus-visible {
      ring: 2px solid currentColor;
      ring-offset: 2px;
    }
</style>