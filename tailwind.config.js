/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nge: {
          black: '#111111',
          white: '#FFFFFF',
          bg: '#FAFAF8',
          'bg-alt': '#F3F2EF',
          muted: '#888888',
          line: '#E5E5E3',
          accent: '#2F4A3D',
          warm: '#C1704A',
          gold: '#F3D9A3',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        num: ['Arial', 'Helvetica', 'sans-serif'],
      },
      maxWidth: {
        container: '1400px',
      },
      boxShadow: {
        drawer: '0 0 60px rgba(0,0,0,0.15)',
        soft: '0 2px 20px rgba(0,0,0,0.06)',
      },
      letterSpacing: {
        mega: '0.25em',
        wide2: '0.18em',
      },
    },
  },
  plugins: [],
};
