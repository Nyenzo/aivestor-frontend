/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1E40AF",
        "primary-dark": "#1e3a8a",
        "background-light": "#F8FAFC",
        "background-dark": "#121520",
        "emerald-custom": "#10B981",
        "gold-accent": "#D97706",
        "purple-accent": "#8B5CF6",
        "text-main": "#111827",
        "surface-panel": "#ffffff",
        "surface-panel-dark": "#18181b",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;