<script lang="ts">
    export let isOpen = true;

    import Navbar from '$lib/navbar.svelte';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    // Accessibility settings
    let colorMode = 'normal'; // 'normal', 'grayscale'
    let textSize = 'medium';  // 'small', 'medium', 'large'

    // Default settings for reset
    const defaultSettings = {
        colorMode: 'normal',
        textSize: 'medium'
    };

    // Apply the changes
    function applyChanges() {
      applyColorMode();
      applyTextSize();
    }

    // Reset to default settings
    function resetToDefault() {
      colorMode = defaultSettings.colorMode;
      textSize = defaultSettings.textSize;
      applyChanges();
    }

    onMount(() => {
        // Apply the initial settings if needed
        applyChanges();
    });

    function applyColorMode() {
      document.documentElement.classList.remove('color-normal', 'color-grayscale');
      document.documentElement.classList.add(`color-${colorMode}`);
    }

    function applyTextSize() {
      document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
      document.documentElement.classList.add(`text-${textSize}`);
    }
</script>

<style>
  /* Styling for color blindness modes */
  .color-normal {
    filter: none;
  }

  .color-grayscale {
    filter: grayscale(100%);
  }

  /* Styling for text size toggles */
  .text-small {
    font-size: 14px;
  }

  .text-medium {
    font-size: 16px;
  }

  .text-large {
    font-size: 18px;
  }

  main {
    transition: margin-left 0.3s ease;
  }

  .main-collapsed {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 250px; /* Adjust this width based on your navbar width */
  }
</style>

<Navbar bind:isOpen />

<main class={`p-6 ${isOpen ? 'main-expanded' : 'main-collapsed'}`}>
  <!-- Center the heading -->
  <div class="flex justify-center">
    <h1 class="text-2xl font-bold mb-6 text-center">Settings</h1>
  </div>

  <section class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Accessibility Options</h2>

    <!-- Color Blindness Toggle -->
    <div class="settings-option mb-4">
      <label for="color-mode" class="block text-gray-700 mb-2">Color Mode:</label>
      <select id="color-mode" bind:value={colorMode} class="w-full p-2 border rounded-md text-gray-700">
        <option value="normal">Normal</option>
        <option value="grayscale">Grayscale</option>
      </select>
    </div>

    <!-- Text Size Toggle -->
    <div class="settings-option mb-4">
      <label for="text-size" class="block text-gray-700 mb-2">Text Size:</label>
      <select id="text-size" bind:value={textSize} class="w-full p-2 border rounded-md text-gray-700">
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>

    <!-- Buttons for Apply and Reset -->
    <div class="flex space-x-4">
      <button on:click={applyChanges} class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
        Apply
      </button>
      <button on:click={resetToDefault} class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">
        Reset to Default
      </button>
    </div>
  </section>
</main>
