/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111624",
        accent: "#6762e8",
        mint: "#37c59b",
      },
    },
  },
  plugins: [],
};
