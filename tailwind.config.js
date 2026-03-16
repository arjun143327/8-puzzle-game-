/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#070B18',
        surface: '#0F1629',
        border: '#1E2D4F',
        gtile: {
          1: '#4285F4',   // Google Blue
          2: '#EA4335',   // Google Red
          3: '#FBBC04',   // Google Yellow
          4: '#34A853',   // Google Green
          5: '#8B5CF6',   // Violet
          6: '#06B6D4',   // Cyan
          7: '#F97316',   // Orange
          8: '#EC4899',   // Pink
        },
      },
      boxShadow: {
        tile: '0 4px 0 rgba(0,0,0,0.4)',
        'tile-hover': '0 6px 0 rgba(0,0,0,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
