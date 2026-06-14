import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0fe',
          100: '#c5d8fd',
          500: '#4285f4',
          600: '#1a73e8',
          700: '#1557b0',
          800: '#0d47a1',
        },
        success: '#34a853',
        warning: '#fbbc04',
        danger: '#ea4335',
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
