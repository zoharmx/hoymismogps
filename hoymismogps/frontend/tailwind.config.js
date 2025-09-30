/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#00aaff',
          50: '#e6f7ff',
          100: '#b3e6ff',
          200: '#80d4ff',
          300: '#4dc3ff',
          400: '#1ab1ff',
          500: '#00aaff',
          600: '#0088cc',
          700: '#006699',
          800: '#004466',
          900: '#002233',
        },
        secondary: {
          DEFAULT: '#0077b3',
          50: '#e6f2f7',
          100: '#b3d9e6',
          200: '#80c0d4',
          300: '#4da7c3',
          400: '#1a8eb1',
          500: '#0077b3',
          600: '#005f8f',
          700: '#00476b',
          800: '#002f47',
          900: '#001724',
        },
        dark: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#363636',
          500: '#424242',
          400: '#4e4e4e',
        },
      },
    },
  },
  plugins: [],
}