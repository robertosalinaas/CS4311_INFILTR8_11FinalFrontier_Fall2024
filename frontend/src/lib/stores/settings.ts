import { writable } from 'svelte/store';

interface Settings {
    theme: 'light' | 'dark';
    textSize: number;
}

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
};

function createSettingsStore() {
    const { subscribe, set, update } = writable<Settings>({
        theme: getInitialTheme(),
        textSize: 16
    });

    return {
        subscribe,
        setTheme: (theme: 'light' | 'dark') => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', theme);
                document.documentElement.style.backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
            }
            update(settings => ({ ...settings, theme }));
        },
        setTextSize: (size: number) => update(settings => ({ ...settings, textSize: size })),
        reset: () => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', 'light');
                document.documentElement.style.backgroundColor = '#ffffff';
            }
            set({ theme: 'light', textSize: 16 });
        }
    };
}

export const settings = createSettingsStore();

// Initialize background color on page load
if (typeof window !== 'undefined') {
    document.documentElement.style.backgroundColor = getInitialTheme() === 'dark' ? '#000000' : '#ffffff';
}