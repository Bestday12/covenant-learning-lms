/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
            colors: {
        brand: {
          50: "#f5f7fb",
          100: "#e8ecf6",
          500: "#3b4d8b",
          600: "#2f3f73",
          700: "#26325c",
          900: "#161c33",
        },
        accent: {
          500: "#c98a3e",
          600: "#a86f2c",
        },
        covenant: {
          50: "#f6f1fb",
          100: "#ece3f7",
          400: "#7a5aa8",
          500: "#5b3d85",
          600: "#432c66",
          700: "#332050",
          900: "#1f1433",
        },
        gold: {
          400: "#e8c25f",
          500: "#d4a935",
          600: "#b8901f",
        },
      },
      fontFamily: {
        serif: ["'Source Serif Pro'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
