import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans:  ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          dark:   '#3D2008',
          brown:  '#8B5E3C',
          tan:    '#C68B57',
          cream:  '#F2D9B5',
          sand:   '#FFF8F0',
          pink:   '#E879A0',
          blush:  '#F4A7B9',
        },
      },
      keyframes: {
        pixelWalk: {
          '0%':   { transform: 'translateX(-160px)' },
          '100%': { transform: 'translateX(calc(100vw + 160px))' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pixel-walk': 'pixelWalk 16s linear infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
