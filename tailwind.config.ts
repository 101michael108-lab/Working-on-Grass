import type {Config} from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        headline: ['var(--font-headline)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        code: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        /* ── Redesign exact-hex tokens (for hand-built storefront components) ── */
        cream: {
          DEFAULT: '#F8F6EF',
          card: '#FEFDFA',
          panel: '#FCFBF6',
          band: '#F3F0E8',
          line: '#ECE7DB',
        },
        ink: '#1B2A1E',
        forest: {
          DEFAULT: '#2E4A34',
          dark: '#223A28',
          bark: '#1D2E22',
        },
        gold: {
          DEFAULT: '#D9B25A',
          deep: '#A9791F',
          text: '#8A6A17',
          bg: '#FBF3DF',
          border: '#E3C877',
        },
        line: {
          DEFAULT: '#DED8C9',
          strong: '#CFC8B7',
        },
        body: {
          DEFAULT: '#4A544D',
          soft: '#55605A',
          mute: '#6B7268',
          faint: '#8C9484',
        },
        ondark: {
          DEFAULT: '#EDE9DD',
          bright: '#F7F4EC',
          soft: '#BFC6BA',
          mute: '#9BA79B',
          faint: '#7E8C7F',
          sage: '#A7B5A6',
        },
        stock: {
          DEFAULT: '#3E8E4F',
          bg: '#EAF1E7',
          border: '#BFD6BD',
        },
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1ebe5d',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        // Warm, ink-tinted elevation tokens (subtle by design).
        lifted: '0 1px 2px rgba(27,42,30,0.04), 0 3px 10px rgba(27,42,30,0.05)',
        'lifted-lg': '0 4px 10px rgba(27,42,30,0.07), 0 16px 32px rgba(27,42,30,0.10)',
        sunken: 'inset 0 1px 3px rgba(27,42,30,0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
