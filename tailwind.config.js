/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mahjong: {
          table: '#2c5530',
          tile: '#f0e6d6',
          tileBorder: '#d4b886',
          red: '#c41e3a',
          green: '#006a4e',
          blue: '#1a5fb4',
        }
      },
      fontFamily: {
        mahjong: ['"Noto Serif SC"', 'serif'],
      },
      boxShadow: {
        'tile': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'tile-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
