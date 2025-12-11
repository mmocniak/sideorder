/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Counter palette
        cream: {
          DEFAULT: '#FAF7F2',
          50: '#FDFCFA',
          100: '#FAF7F2',
          200: '#F2EBE0',
        },
        espresso: {
          DEFAULT: '#5C4033',
          50: '#F5F0ED',
          100: '#E6DCD4',
          200: '#C9B5A3',
          300: '#A98B71',
          400: '#7D5E48',
          500: '#5C4033',
          600: '#4A332A',
          700: '#382720',
          800: '#261A15',
          900: '#140E0B',
        },
        terracotta: {
          DEFAULT: '#C67D4D',
          50: '#FBF5F1',
          100: '#F4E4D9',
          200: '#E9CAB3',
          300: '#DDAF8D',
          400: '#D29468',
          500: '#C67D4D',
          600: '#A6623A',
          700: '#7D4A2C',
          800: '#53311D',
          900: '#2A190F',
        },
        oat: {
          DEFAULT: '#D4C9BE',
          50: '#F9F8F6',
          100: '#EFECE8',
          200: '#E4DED6',
          300: '#D4C9BE',
          400: '#BFB0A0',
          500: '#A99783',
          600: '#8D7A64',
          700: '#6B5D4C',
          800: '#483E33',
          900: '#241F19',
        },
        roast: {
          DEFAULT: '#2C2420',
          50: '#F5F4F3',
          100: '#E6E3E2',
          200: '#C9C4C1',
          300: '#ACA4A0',
          400: '#8F857F',
          500: '#72665F',
          600: '#574E48',
          700: '#3C3632',
          800: '#2C2420',
          900: '#1A1614',
        },
        // Map to ShadCN semantic colors
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 2px 8px -2px rgba(92, 64, 51, 0.1), 0 4px 16px -4px rgba(92, 64, 51, 0.1)',
        'warm-lg': '0 4px 16px -4px rgba(92, 64, 51, 0.15), 0 8px 32px -8px rgba(92, 64, 51, 0.1)',
        'warm-sm': '0 1px 3px -1px rgba(92, 64, 51, 0.1), 0 1px 2px -1px rgba(92, 64, 51, 0.06)',
      },
    },
  },
  plugins: [],
}
