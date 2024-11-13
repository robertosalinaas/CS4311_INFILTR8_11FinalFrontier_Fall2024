import { writable } from 'svelte/store';

// Define types
export type Theme = 'light' | 'dark' | 'colorblind';

interface Settings {
    theme: Theme;
    textSize: number;
}

// Create the store with default values
function createSettingsStore() {
    const defaultSettings: Settings = {
        theme: 'light',
        textSize: 16
    };

    // Load saved settings from localStorage
    const loadSettings = (): Settings => {
        if (typeof window === 'undefined') return defaultSettings;
        
        const savedSettings = localStorage.getItem('userSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    };

    const { subscribe, set, update } = writable<Settings>(loadSettings());

    return {
        subscribe,
        setTheme: (theme: Theme) => {
            update(settings => {
                const newSettings = { ...settings, theme };
                localStorage.setItem('userSettings', JSON.stringify(newSettings));
                return newSettings;
            });
        },
        setTextSize: (size: number) => {
            update(settings => {
                const newSettings = { ...settings, textSize: size };
                localStorage.setItem('userSettings', JSON.stringify(newSettings));
                return newSettings;
            });
        },
        reset: () => {
            set(defaultSettings);
            localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
        }
    };
}

export const settings = createSettingsStore();