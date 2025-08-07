/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#8C2832',
        'primary-dark': '#6D1F27',
        'primary-light': '#F9EBEA',
        'secondary': '#333333',
        'accent': '#BFA16A',
      },
    },
  },
}