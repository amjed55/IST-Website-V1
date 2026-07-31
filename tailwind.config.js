/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ist: {
          green: '#0B3D36',
          'green-deep': '#072A25',
          teal: '#0D9488',
          'teal-light': '#14B8A6',
          cream: '#F3EFE6',
          'cream-dark': '#EBE4D8',
          gold: '#B8944A',
          ink: '#12201D',
          muted: '#5C6B66',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px rgba(11, 61, 54, 0.12)',
        lift: '0 16px 48px rgba(11, 61, 54, 0.18)',
      },
    },
  },
  plugins: [],
};
