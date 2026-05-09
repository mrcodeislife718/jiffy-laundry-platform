/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        dark: '#0a1f2e',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        'light-gray': '#e8f4f8',
      },
    },
  },
  plugins: [],
};
