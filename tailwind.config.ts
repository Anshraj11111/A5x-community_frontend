import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0B',
        card: '#111111',
        secondary: '#1A1A1A',
        primary: {
          DEFAULT: '#00FF88',
          foreground: '#0B0B0B',
        },
        border: '#222222',
        muted: {
          DEFAULT: '#1A1A1A',
          foreground: '#A0A0A0',
        },
        foreground: '#FFFFFF',
        destructive: {
          DEFAULT: '#FF4444',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#1A1A1A',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#FFFFFF',
        },
        input: '#222222',
        ring: '#00FF88',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 136, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 255, 136, 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
