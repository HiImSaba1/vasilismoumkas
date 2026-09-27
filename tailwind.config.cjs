/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "off-white": "#f8f5f0",
        "ink-black": "#050505",
        "soft-yellow": "#f7e27b",
      },
      zIndex: {
        99: "99",
      },
      fontFamily: {
        karena: ["var(--font-karena)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};