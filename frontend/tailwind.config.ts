import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"], // Define the paths where Tailwind should look for classes
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      // Adding custom colors for color blindness
      colors: {
        grayscale: {
          DEFAULT: '#808080', // Color for grayscale
        },
        deuteranopia: {
          DEFAULT: '#FFCC00', // Color for deuteranopia
        },
        protanopia: {
          DEFAULT: '#FF6600', // Color for protanopia
        },
        tritanopia: {
          DEFAULT: '#99CCFF', // Color for tritanopia
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // Add additional plugins, like Tailwind Typography
  ],
};

export default config;
