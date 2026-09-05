module.exports = {
  content: ['./frontend/src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'bounce-dot': 'bounce-dot 0.7s infinite ease-in-out both',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        card: '1rem',
        control: '0.5rem',
        container: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        dialog:
          '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      height: {
        '112': '28rem',
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
};
