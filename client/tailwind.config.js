/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark surface scale (maps to old 'beige' tokens used throughout the app)
        beige: {
          50: '#1a1a1a',   // lightest surface / inner hover
          100: '#1e1e1e',   // table headers, inner sections
          200: '#2a2a2a',   // borders, dividers
          300: '#f0f0f0',   // primary text on dark (near-white)
          400: '#6b6b6b',   // muted icons
          500: '#4d4d4d',   // placeholder / subtle text
          600: '#333333',   // very dim text
        },
        // Near-black backgrounds
        dark: {
          DEFAULT: '#000000',
          light: '#161616',   // card backgrounds
          lighter: '#1e1e1e',   // inner elements / hover
          sidebar: '#0a0a0a',   // sidebar background
        },
        // Neon green accent
        accent: {
          DEFAULT: '#4ade80',
          dark: '#22c55e',
          dim: 'rgba(74,222,128,0.12)',
          foreground: '#111111',
        },
        // Standard shadcn-like color system
        background: '#000000',
        foreground: '#f0f0f0',
        primary: {
          DEFAULT: '#4ade80',
          foreground: '#111111',
        },
        secondary: {
          DEFAULT: '#1e1e1e',
          foreground: '#f0f0f0',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f0f0f0',
        },
        muted: {
          DEFAULT: '#1a1a1a',
          foreground: '#6b6b6b',
        },
        popover: {
          DEFAULT: '#111111',
          foreground: '#f0f0f0',
        },
        card: {
          DEFAULT: '#161616',
          foreground: '#f0f0f0',
        },
        border: '#2a2a2a',
        input: '#2a2a2a',
        ring: '#4ade80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'green': '0 0 24px rgba(74,222,128,0.15)',
        'green-sm': '0 0 8px rgba(74,222,128,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.6)',
      },
      keyframes: {
        spotlight: {
          '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -40%) scale(1)' },
        },
      },
      animation: {
        spotlight: 'spotlight 2s ease .75s 1 forwards',
      },
    },
  },
  plugins: [],
}
