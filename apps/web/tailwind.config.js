/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0A08',
        'bg-2': '#100E0B',
        'bg-3': '#161310',
        ink: '#F4EDE0',
        'ink-mute': '#9C9486',
        line: '#2A251E',
        saffron: '#E8631F',
        mustard: '#F5C542',
        clay: '#8C3A1A',
        parchment: '#E9DCC4'
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        body: ['Archivo', 'sans-serif'],
        deva: ['"Tiro Devanagari Hindi"', 'serif']
      },
      letterSpacing: {
        wider2: '.18em',
        widest2: '.28em'
      }
    }
  },
  plugins: []
}
