/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        nexa: {
          dark: 'rgb(var(--color-dark) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          primary: 'rgb(var(--color-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        }
      }
    }
  },
  plugins: [],
}