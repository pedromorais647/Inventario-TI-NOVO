/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        folha: { 50: "#f1f8f2", 100: "#dff0e2", 200: "#bfe0c6", 500: "#3f9a55", 600: "#2f7f44", 700: "#256637", 800: "#1e5230", 900: "#143a22" },
        laranja: { 100: "#fde9d2", 500: "#f29a2e", 600: "#d97f12" },
        papel: "#f6f8f5",
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
