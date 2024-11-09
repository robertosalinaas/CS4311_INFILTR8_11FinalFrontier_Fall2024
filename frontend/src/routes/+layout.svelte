<script lang="ts">
  import "../app.css";
  import { settingsStore } from '../settingsStore';

  let settings;

  // Subscribe to the settingsStore to get the current settings
  settingsStore.subscribe((value) => {
    settings = value;
    applySettings();
  });

  // Function to apply settings to the document's classList
  function applySettings() {
    if (typeof document !== 'undefined') { // Check if `document` is defined
      document.documentElement.classList.toggle('dark', settings.darkMode === 'on');

      // Apply color mode
      document.documentElement.classList.remove('color-normal', 'color-grayscale', 'color-deuteranopia', 'color-protanopia', 'color-tritanopia');
      document.documentElement.classList.add(`color-${settings.colorMode}`);

      // Apply text size
      document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
      document.documentElement.classList.add(`text-${settings.textSize}`);
    }
  }
</script>

<slot />