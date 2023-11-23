/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', 'script.js'],
  theme: {
    extend: {
      fontFamily: 'Calibri, sans-serif',
      boxShadow: {
        'xl': '0 0px 25px 10px rgb(0 0 0 / 0.2), 0 12px 10px 6px rgb(0 0 0 / 0.25)'
      },
      keyframes: {
        shake: {
          '0%': { translate: '0 0' },
          '20%': { translate: '8px 8px' },
          '40%': { translate: '-5px -5px' },
          '60%': { translate: '0 4px' },
          '80%': { translate: '3px -3px' },
          '100%': { translate: '-2px 2px' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100': { opacity: '100' },
        },
        pop: {
          '0%': { scale: '1' },
          '25%': { scale: '1.5' },
          '50%': { scale: '1' },
          '70%': { scale: '1.15' },
          '100%': { scale: '1' },
        },
      },
      animation: {
        shake: 'shake 0.19s',
        fastFade: 'fade 0.2s',
        slowFade: 'fade 2s',
        pop: 'pop 0.45s ease-out',
      },
    },
  },
  plugins: [],
}
