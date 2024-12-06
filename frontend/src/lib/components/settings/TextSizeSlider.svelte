<script lang="ts">
  import { settings } from '$lib/stores/settings';

  export let themeClasses: {
      text: string;
      subtext: string;
      border: string;
      previewBg: string;
  };

  function updateTextSize(event: Event) {
      const target = event.target as HTMLInputElement;
      settings.setTextSize(Number(target.value));
  }

  $: isDarkMode = $settings.theme === 'dark';
</script>

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
              value={$settings.textSize}
              on:input={updateTextSize}
              class="w-full slider-custom {isDarkMode ? 'dark' : ''}"
          />
      </div>
      <span class="text-xl {themeClasses.subtext} w-8">Aa</span>
  </div>

  <!-- Preview Text -->
  <div class="p-6 rounded-lg border {themeClasses.border} shadow-md {themeClasses.previewBg}">
      <h3 class="font-semibold mb-2 {themeClasses.text}" style="font-size: {$settings.textSize}px">
          Preview Text
      </h3>
      <p class="{themeClasses.subtext}" style="font-size: {$settings.textSize}px">
          This is how your text will look across the application. Adjust the slider to find the perfect size for your needs.
      </p>
  </div>
</div>

<style>
  .slider-custom {
      -webkit-appearance: none;
      appearance: none;
      height: 8px;
      border-radius: 8px;
      background: #e2e8f0;
      outline: none;
  }

  /* Light mode styles */
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

  /* Dark mode styles */
  .slider-custom.dark {
      background: #374151;
  }

  .slider-custom.dark::-webkit-slider-thumb {
      background: #6B7280;
      border: 2px solid #374151;
  }

  .slider-custom.dark::-webkit-slider-thumb:hover {
      background: #4B5563;
  }

  .slider-custom.dark::-moz-range-thumb {
      background: #6B7280;
      border: 2px solid #374151;
  }

  .slider-custom.dark::-moz-range-thumb:hover {
      background: #4B5563;
  }
</style>