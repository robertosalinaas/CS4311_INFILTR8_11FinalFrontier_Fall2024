<script lang="ts">
  export let isOpen = true;

  import Navbar from '$lib/navbar.svelte';
  import { onMount } from 'svelte';

  // Accessibility settings
  let colorMode = 'normal'; // 'normal', 'grayscale'
  let textSize = 'medium';  // 'small', 'medium', 'large'
  let darkMode = 'off'; // 'on', 'off'

  // Default settings for reset
  const defaultSettings = {
      colorMode: 'normal',
      textSize: 'medium',
      darkMode: 'off',
  };

  // Apply the changes (dark mode, color mode, and text size)
  function applyChanges() {
    applyColorMode();
    applyTextSize();
    applyDarkMode();
  }

  // Reset to default settings
  function resetToDefault() {
    colorMode = defaultSettings.colorMode;
    textSize = defaultSettings.textSize;
    darkMode = defaultSettings.darkMode;
    applyChanges();
  }

  // Persist the dark mode setting and other changes when mounted
  onMount(() => {
      // Retrieve saved dark mode setting from localStorage
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) {
          darkMode = savedDarkMode;
          applyDarkMode();
      }

      // Apply the initial settings for color mode and text size
      applyChanges();
  });

  // Apply color blindness modes
  function applyColorMode() {
    document.documentElement.classList.remove('color-normal', 'color-grayscale');
    document.documentElement.classList.add(`color-${colorMode}`);
  }

  // Apply text size changes
  function applyTextSize() {
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }

  // Apply dark mode and persist it in localStorage
  function applyDarkMode() {
    if (darkMode === 'on') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'on');  // Save the preference to localStorage
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'off');  // Save the preference to localStorage
    }
  }
</script>

<Navbar bind:isOpen />

<main class={`p-6 ${isOpen ? 'main-expanded' : 'main-collapsed'}`}>
  <!-- Center the heading -->
  <div class="flex justify-center">
    <h1 class="text-2xl font-bold mb-6 text-center dark:text-gray-200">Settings</h1>
  </div>

  <section class="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800">
    <h2 class="text-xl font-semibold mb-4 dark:text-gray-200">Accessibility Options</h2>

    <!-- Color Blindness Toggle -->
    <div class="settings-option mb-4">
      <label for="color-mode" class="block text-gray-700 mb-2 dark:text-gray-200">Color Mode:</label>
      <select id="color-mode" bind:value={colorMode} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
        <option value="normal">Normal</option>
        <option value="grayscale">Grayscale</option>
      </select>
    </div>

    <!-- Text Size Toggle -->
    <div class="settings-option mb-4">
      <label for="text-size" class="block text-gray-700 mb-2 dark:text-gray-200">Text Size:</label>
      <select id="text-size" bind:value={textSize} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <!-- Dark Mode Toggle -->
    <div class="settings-option mb-4">
      <label for="dark-mode" class="block text-gray-700 mb-2 dark:text-gray-200">Dark Mode:</label>
      <select id="dark-mode" bind:value={darkMode} class="w-full p-2 border rounded-md text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
        <option value="off">Off</option>
        <option value="on">On</option>
      </select>
    </div>

    <!-- Buttons for Apply and Reset -->
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
