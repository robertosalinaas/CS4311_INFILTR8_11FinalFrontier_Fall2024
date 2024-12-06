export const themes = {
  light: {
    name: "light",
    icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4"/>
            <path stroke-linecap="round" d="M12 2v2"/>
            <path stroke-linecap="round" d="M12 20v2"/>
            <path stroke-linecap="round" d="M4.93 4.93l1.41 1.41"/>
            <path stroke-linecap="round" d="M17.66 17.66l1.41 1.41"/>
            <path stroke-linecap="round" d="M2 12h2"/>
            <path stroke-linecap="round" d="M20 12h2"/>
            <path stroke-linecap="round" d="M6.34 17.66l-1.41 1.41"/>
            <path stroke-linecap="round" d="M19.07 4.93l-1.41 1.41"/>
        </svg>
      `,
    label: "Light",
    description: "Bright and clear",
    colors: {
      iconColor: "text-amber-500",
      selectedBorder: "border-blue-500",
      selectedBg: "bg-blue-50",
      checkmark: "text-blue-500",
    },
  },
  dark: {
    name: "dark",
    icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      `,
    label: "Dark",
    description: "Easy on the eyes",
    colors: {
      iconColor: "text-gray-300",
      selectedBorder: "border-gray-600",
      selectedBg: "bg-gray-900",
      checkmark: "text-gray-300",
    },
  },
} as const;

// Type for theme names
export type ThemeName = keyof typeof themes;
