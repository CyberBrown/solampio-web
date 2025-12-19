/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        solamp: {
          "primary": "#F97316",      // Solar orange
          "secondary": "#1E3A5F",    // Deep blue
          "accent": "#FBBF24",       // Gold/yellow
          "neutral": "#1f2937",      // Slate gray
          "base-100": "#ffffff",     // White background
          "base-200": "#f9fafb",     // Light gray
          "base-300": "#e5e7eb",     // Medium gray
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
};
