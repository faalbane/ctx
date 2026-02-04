/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neural-dark': '#0a0e27',
        'neural-purple': '#7c3aed',
        'neural-blue': '#3b82f6',
        'neural-cyan': '#06b6d4',
      },
    },
  },
  plugins: [],
}
