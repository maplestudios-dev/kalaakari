export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0A08', 'bg-2': '#100E0B', ink: '#F4EDE0', 'ink-mute': '#9C9486',
        line: '#2A251E', saffron: '#E8631F', mustard: '#F5C542'
      },
      fontFamily: { display: ['Anton','sans-serif'], body: ['Archivo','sans-serif'], deva: ['"Tiro Devanagari Hindi"','serif'] }
    }
  }
}
