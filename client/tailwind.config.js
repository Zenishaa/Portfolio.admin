/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        accent:  "var(--accent)",
        primary: "var(--button-primary)",
        "primary-foreground": "var(--button-text)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger:  "var(--danger)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        accent: "var(--shadow-accent)",
        card:   "var(--shadow-md)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, var(--grad-start), var(--grad-end))",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.4,0,0.2,1) both",
        "float":      "float 4s ease-in-out infinite",
        "orb-pulse":  "orb-pulse 8s ease-in-out infinite alternate",
      },
    },
  },

  plugins: [],
};