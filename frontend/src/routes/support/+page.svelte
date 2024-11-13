<script lang="ts">
    import { goto } from '$app/navigation';
    import Navbar from '$lib/navbar.svelte';
    import { settings } from '$lib/stores/settings';
  
    export let isOpen = true;
  
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
      border: $settings.theme === 'light'
          ? 'border-gray-200'
          : $settings.theme === 'dark'
              ? 'border-gray-700'
              : 'border-yellow-200'
    };
  
    function handleHelp() {
      window.open('https://www.google.com', '_blank');
    }
  </script>
  
  <Navbar bind:isOpen />
  
  <main class="p-6 {isOpen ? 'main-expanded' : 'main-collapsed'} min-h-screen transition-all duration-500 ease-in-out {themeClasses.container}">
    <div class="max-w-7xl mx-auto">
      <div class="relative flex items-center justify-center h-[calc(100vh-2rem)]">
        <button
            on:click={handleHelp}
            class="absolute top-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
            aria-label="Open Google"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.25 15.75a3 3 0 113-3m-1.5 5.25h.008v.008H9.75v-.008m2.25 0a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
                />
            </svg>
        </button>
  
        <div class="flex items-center justify-center w-3/4 h-3/4 rounded-xl shadow-lg {themeClasses.card} border {themeClasses.border}">
            <p class="{themeClasses.text} text-xl">Video Placeholder</p>
        </div>
      </div>
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