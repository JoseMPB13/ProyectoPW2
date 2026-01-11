/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8', // Main corporate blue
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
           bg: '#0f172a', // Slate 900
           hover: '#1e293b', // Slate 800
           active: '#334155', // Slate 700
           text: '#cbd5e1', // Slate 300
        }
      },
    },
  },
  plugins: [],
}
