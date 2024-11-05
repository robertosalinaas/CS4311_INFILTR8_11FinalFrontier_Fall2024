import { writable } from 'svelte/store';

// Define the settings store
const createSettingsStore = () => {
  const defaultSettings = {
    colorMode: 'normal',
    textSize: 'medium',
    darkMode: 'off'
  };

  let initialSettings = defaultSettings;

  // Check if we're in the browser and localStorage is available
  if (typeof window !== 'undefined' && localStorage) {
    initialSettings = {
      colorMode: localStorage.getItem('colorMode') || defaultSettings.colorMode,
      textSize: localStorage.getItem('textSize') || defaultSettings.textSize,
      darkMode: localStorage.getItem('darkMode') || defaultSettings.darkMode
    };
  }

  const { subscribe, set, update } = writable(initialSettings);

  return {
    subscribe,
    set,
    update,
    applyChanges: () => {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem('colorMode', initialSettings.colorMode);
        localStorage.setItem('textSize', initialSettings.textSize);
        localStorage.setItem('darkMode', initialSettings.darkMode);
      }
    },
    resetToDefault: () => set(defaultSettings)
  };
};

export const settingsStore = createSettingsStore();