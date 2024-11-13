import { writable } from 'svelte/store';

// Define the settings store
const createSettingsStore = () => {
  const defaultSettings = {
    colorMode: 'normal',
    textSize: 'medium',
    darkMode: 'off'
  };

  // Check if we're in the browser and localStorage is available
  let initialSettings = defaultSettings;

  if (typeof window !== 'undefined' && localStorage) {
    initialSettings = {
      colorMode: localStorage.getItem('colorMode') || defaultSettings.colorMode,
      textSize: localStorage.getItem('textSize') || defaultSettings.textSize,
      darkMode: localStorage.getItem('darkMode') || defaultSettings.darkMode
    };
  }

  const { subscribe, set, update } = writable(initialSettings);

  // Apply changes to localStorage whenever settings are updated
  const applyChanges = (newSettings) => {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('colorMode', newSettings.colorMode);
      localStorage.setItem('textSize', newSettings.textSize);
      localStorage.setItem('darkMode', newSettings.darkMode);
    }
  };

  return {
    subscribe,
    set,
    update: (fn) => {
      update((currentSettings) => {
        const updatedSettings = fn(currentSettings);
        applyChanges(updatedSettings);
        return updatedSettings;
      });
    },
    applyChanges, // Expose applyChanges if needed elsewhere
    resetToDefault: () => {
      set(defaultSettings);
      applyChanges(defaultSettings); // Reset localStorage to default as well
    }
  };
};

export const settingsStore = createSettingsStore();