import { type Config } from 'tailwindcss';
import { colors as customColors } from './src/tailwind/colors';
import { keyframes, animations } from './src/tailwind/animations';
import { zIndex } from './src/tailwind/zIndex';

export default {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // import
      zIndex,
      keyframes,
      animations,
      // fontFamily
      fontFamily: {
        body: ['var(--font-noto-sans-jp)', 'sans-serif'],
      },
      // colors
      colors: {
        // import
        ...customColors,
        // card
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // popover
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // chart
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // sidebar
        sidebar: {
          DEFAULT:    'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border:     'hsl(var(--sidebar-border))',
          ring:       'hsla(var(--sidebar-ring))',
          primary:    'hsl(var(--sidebar-primary))',
          accent:     'hsl(var(--sidebar-accent))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        },
      },
      // borderRadius
      borderRadius: {
        lg:           'var(--radius)',
        md:           'calc(var(--radius) - 2px)',
        sm:           'calc(var(--radius) - 4px)',
        golden:       '0.618rem',
        'golden-phi': '1.618rem',
        '1/4':        '.25rem',
        '1/3':        '.33rem',
        '1/2':        '.5rem',
        '2/3':        '.66rem',
        '3/4':        '.75rem',
        '1':          '1rem',
        '5/4':        '1.25rem',
        '4/3':        '1.33rem',
        '3/2':        '1.5rem',
        '5/3':        '1.66rem',
        '7/4':        '1.75rem',
        '2':          '2rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;