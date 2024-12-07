import { derived } from "svelte/store";
import { settings } from "$lib/stores/settings";

export const themeClasses = derived(settings, ($settings) => {
  const theme = $settings.theme;

  return {
    container:
      theme === "light"
        ? "bg-gray-50 text-gray-900"
        : "bg-gray-950 text-gray-100",
    card: theme === "light" ? "bg-white" : "bg-gray-900",
    text: theme === "light" ? "text-gray-900" : "text-gray-100",
    subtext: theme === "light" ? "text-gray-600" : "text-gray-400",
    border: theme === "light" ? "border-gray-200" : "border-gray-800",
    previewBg: theme === "light" ? "bg-white" : "bg-gray-900",
    background: theme === "light" ? "bg-white" : "bg-black",
  };
});

export const navbarThemeClasses = derived(settings, ($settings) => {
  const theme = $settings.theme;

  return {
    base:
      theme === "light"
        ? "bg-white text-gray-900 border-r border-gray-200"
        : "bg-gray-900 text-gray-100 border-r border-gray-800",
    button: theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-800",
    logoutButton:
      theme === "light"
        ? "hover:bg-gray-200 hover:text-gray-900"
        : "hover:bg-gray-800 hover:text-gray-100",
    toggleButton:
      theme === "light"
        ? "bg-white text-gray-900"
        : "bg-gray-900 text-gray-100",
  };
});
