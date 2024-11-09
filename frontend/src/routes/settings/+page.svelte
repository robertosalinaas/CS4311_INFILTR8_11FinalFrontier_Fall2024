<script lang="ts">
  export let isOpen = true;

  import Navbar from '$lib/navbar.svelte';
  import { onMount } from 'svelte';
  import { settingsStore } from '../../settingsStore';

  // Initialize default settings
  let settings = {
    colorMode: 'normal',
    textSize: 'medium',
    darkMode: 'off'
  };

  // Subscribe to settingsStore and apply settings
  onMount(() => {
    settingsStore.subscribe(value => {
      settings = value;
    });
  });

  // Apply settings by updating the store
  function applyChanges() {
    settingsStore.update(prev => ({
      ...prev,
      colorMode: settings.colorMode,
      textSize: settings.textSize,
      darkMode: settings.darkMode
    }));

    // Apply to localStorage
    localStorage.setItem('colorMode', settings.colorMode);
    localStorage.setItem('textSize', settings.textSize);
    localStorage.setItem('darkMode', settings.darkMode);
  }

  // Reset settings to default by updating the store
  function resetToDefault() {
    settingsStore.set({
      colorMode: 'normal',
      textSize: 'medium',
      darkMode: 'off'
    });

    // Reset localStorage
    localStorage.removeItem('colorMode');
    localStorage.removeItem('textSize');
    localStorage.removeItem('darkMode');
  }

  // Update dark mode toggle state based on color mode
  $: isDarkModeDisabled = settings.colorMode !== 'normal';
</script>

<Navbar bind:isOpen />

<main class={`p-6 ${isOpen ? 'main-expanded' : 'main-collapsed'}`}>
  <div class="flex justify-center">
    <h1 class="text-2xl font-bold mb-6 text-center dark:text-gray-200">Settings</h1>
  </div>

  <section class="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800">
    <h2 class="text-xl font-semibold mb-4 dark:text-gray-200">Accessibility Options</h2>

    <!-- Color Mode Selector -->
    <div class="settings-option mb-4">
      <label for="color-mode" class="block text-gray-700 mb-2 dark:text-gray-200">Color Mode:</label>
      <select id="color-mode" bind:value={settings.colorMode} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
        <option value="normal">Normal</option>
        <option value="grayscale">Grayscale</option>
        <option value="deuteranopia">Deuteranopia</option>
        <option value="protanopia">Protanopia</option>
        <option value="tritanopia">Tritanopia</option>
      </select>
    </div>

    <!-- Text Size Selector -->
    <div class="settings-option mb-4">
      <label for="text-size" class="block text-gray-700 mb-2 dark:text-gray-200">Text Size:</label>
      <select id="text-size" bind:value={settings.textSize} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <!-- Dark Mode Selector -->
    <div class="settings-option mb-4">
      <label for="dark-mode" class="block text-gray-700 mb-2 dark:text-gray-200">Dark Mode:</label>
      <select id="dark-mode" bind:value={settings.darkMode} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" disabled={isDarkModeDisabled}>
        <option value="off">Off</option>
        <option value="on">On</option>
      </select>
    </div>

    <!-- Apply and Reset Buttons -->
    <div class="flex space-x-4">
      <button on:click={applyChanges} class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition dark:bg-gray-700 dark:hover:bg-gray-600">
        Apply
      </button>
      <button on:click={resetToDefault} class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition dark:bg-gray-600 dark:hover:bg-gray-500">
        Reset to Default
      </button>
    </div>
  </section>
</main>

<style>
  main {
    transition: margin-left 0.3s ease;
  }

  .main-collapsed {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 250px; /* Adjust this width based on your navbar width */
  }

  @media (max-width: 1024px) {
    .main-expanded {
      margin-left: 0;
    }
  }
</style>