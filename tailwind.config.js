/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'solamp-forest': '#042e0d',
        'solamp-green': '#56c270',
        'solamp-blue': '#5974c3',
        'solamp-bronze': '#c3a859',
        'solamp-bronze-dark': '#856d2b',
        'solamp-mist': '#f1f1f2',
        'solamp-mint': '#b1e1bc',
      },
      fontFamily: {
        'heading': ['Barlow', 'sans-serif'],
        'body': ['"Source Sans 3"', 'sans-serif'],
        'mono': ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        solamp: {
          "primary": "#042e0d",      // Deep Forest Green - headers, authority
          "secondary": "#5974c3",    // Solamp Blue - technical, links
          "accent": "#56c270",       // Vibrant Green - CTAs, success
          "neutral": "#1f2937",      // Dark gray
          "base-100": "#f1f1f2",     // Pale Mist - backgrounds
          "base-200": "#e5e5e6",     // Slightly darker bg
          "base-300": "#d4d4d5",     // Even darker bg
          "info": "#5974c3",         // Blue
          "success": "#56c270",      // Vibrant Green
          "warning": "#c3a859",      // Bronze - warnings
          "error": "#ef4444",        // Red
        },
      },
    ],
  },
};
