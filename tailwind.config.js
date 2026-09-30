/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        cyber: { black: '#18201d', dark: '#1f2937', green: '#00ff9d', emerald: '#10b981', dim: '#132e25' },
        apple: { gray: '#f5f5f7', card: '#1c1c1e', red: '#FF453A' }
      },
      animation: {
        'aurora': 'aurora 20s linear infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        aurora: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: { '0%': { boxShadow: '0 0 5px #00ff9d' }, '100%': { boxShadow: '0 0 20px #00ff9d, 0 0 10px #10b981' } }
      }
    }
  },
  plugins: [],
}