import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-dark': '#13131a',
        'surface-light': '#ffffff',
        'border-dark': '#1e1e2e',
        'border-light': '#e2e2ea',
        'bg-dark': '#0a0a0f',
        'bg-light': '#f4f4f8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
