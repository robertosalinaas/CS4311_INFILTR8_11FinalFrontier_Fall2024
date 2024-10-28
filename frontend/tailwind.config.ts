import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"], // Define the paths where Tailwind should look for classes
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      // You can add custom themes or extend default ones here
    }
  },
  plugins: [
    require("@tailwindcss/typography"), // Add additional plugins, like Tailwind Typography
  ],
};

export default config;