/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing shadcn/ui colors for compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // nexLevel Professional Color Palette
        // Designed for accountability, productivity, and calmness
        brand: {
          // Primary: Deep Blue (Trust, Reliability, Professionalism)
          primary: '#2563eb',        // blue-600
          'primary-dark': '#1e40af', // blue-700
          'primary-light': '#3b82f6', // blue-500
          
          // Secondary: Teal (Balance, Calmness, Focus)
          secondary: '#0d9488',      // teal-600
          'secondary-dark': '#0f766e', // teal-700
          'secondary-light': '#14b8a6', // teal-500
          
          // Accent: Indigo (Consistency, Stability)
          accent: '#4f46e5',         // indigo-600
          'accent-dark': '#4338ca',  // indigo-700
          'accent-light': '#6366f1', // indigo-500
          
          // Success: Green (Achievement, Progress)
          success: '#16a34a',        // green-600
          'success-dark': '#15803d', // green-700
          'success-light': '#22c55e', // green-500
          
          // Warning: Amber (Attention without alarm)
          warning: '#d97706',        // amber-600
          
          // Neutral: Slate (Professional, Clean)
          neutral: '#64748b',        // slate-500
          'neutral-light': '#94a3b8', // slate-400
          'neutral-dark': '#475569',  // slate-600
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // Subtle gradients for depth - NO competing colors
        'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        'gradient-calm': 'linear-gradient(135deg, #3b82f6 0%, #0d9488 100%)', // Blue to teal
        'gradient-success': 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      },
      boxShadow: {
        'brand': '0 10px 40px -10px rgba(37, 99, 235, 0.3)',
        'brand-lg': '0 20px 60px -15px rgba(37, 99, 235, 0.4)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.4)',
        'success': '0 10px 40px -10px rgba(22, 163, 74, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
